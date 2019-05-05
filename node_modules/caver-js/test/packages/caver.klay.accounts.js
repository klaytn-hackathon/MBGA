const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const setting = require('./setting')
const utils = require('./utils')
const Caver = require('../../index.js')
const BN = require('bn.js')

const MessagePrefix = "\x19Klaytn Signed Message:\n"

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

function isAccount(data, { privateKey, address } = {}) {
  // account object keys
  const keys = [
    'address',
    'privateKey',
    'signTransaction',
    'sign',
    'encrypt',
  ]

  // key 모두 있는지 확인
  expect(Object.getOwnPropertyNames(data)).to.deep.equal(keys)

  // 유효한 주소인지 체크
  expect(caver.utils.isAddress(data.address)).to.equal(true)

  // 비교할 privateKey가 있다면 비교
  if (privateKey !== undefined) {
    expect(data.privateKey).to.equal(privateKey)
  }

  // 비교할 주소가 있다면 주소 비교
  if (address !== undefined) {
    expect(data.address).to.equal(address)
  }
}

function checkHashMessage(hashed, originMessage) {
  const enveloped = MessagePrefix + originMessage.length + originMessage
  const originHashed = caver.utils.sha3(enveloped)
  expect(hashed).to.equal(originHashed)
}

function isKeystoreV3(data, { address }) {
  // key 비교
  const keys = ['version', 'id', 'address', 'crypto']
  expect(Object.getOwnPropertyNames(data)).to.deep.equal(keys)

  // address 유효성 체크
  expect(caver.utils.isAddress(data.address)).to.equal(true)

  // address 비교
  // data.address format : hex prefix (0x) 없고, 모두 소문자
  prefixTrimmed = data.address.replace(/^(0x)*/i, '')
  expect(prefixTrimmed).to.match(new RegExp(`^${address.slice(2)}$`, 'i'))
}

function isWallet(data, { accounts } = {}) {
  // check if function exists
  const fns = ['add', 'remove', 'clear']
  fns.forEach(fn => {
    expect(fn in data).to.equal(true)
  })

  // defaultKeyName 확인
  expect(data.defaultKeyName).to.equal('caverjs_wallet')

  // accounts 정보가 wallet에 존재하는지 확인
  if (accounts && accounts.length > 0) {
    expect(data.length).to.equal(accounts.length)

    for (let i = 0; i < data.length; i++) {
        // index 로 account 정보 조회하여 비교
        let accountObj = Object.assign({}, data[i])
        delete accountObj.index

        isAccount(accountObj, { privateKey: accounts[i].privateKey, address: accounts[i].address })

        // address 로 account 정보 조회하여 비교
        accountObj = Object.assign({}, data[accountObj.address])
        delete accountObj.index

        isAccount(accountObj, { privateKey: accounts[i].privateKey, address: accounts[i].address })
    }
  }
}

describe('caver.klay.accounts.create', () => {
  context('input: no parameter', () => {
    it('should return valid account', () => {
      const result = caver.klay.accounts.create()
      return isAccount(result)
    })
  })

  context('input: entropy', () => {
    it('should return valid account', () => {
      const entropy = caver.utils.randomHex(32)

      const result = caver.klay.accounts.create(entropy)
      return isAccount(result)
    })
  })
})

describe('caver.klay.accounts.privateKeyToAccount', () => {
  context('input: valid privatekey', () => {
    it('should return valid account', () => {
      const privateKey = caver.utils.randomHex(32)
      const result = caver.klay.accounts.privateKeyToAccount(privateKey)
      return isAccount(result)
    })
  })

  context('input: invalid privatekey', () => {
    it('should throw an error', () => {
      const invalidPrivateKey = caver.utils.randomHex(31)

      const errorMessage = 'Invalid private key'
      expect(() => caver.klay.accounts.privateKeyToAccount(invalidPrivateKey))
        .to.throw(errorMessage)
    })
  })
})

describe('caver.klay.accounts.signTransaction', () => {
  const txObj = {
    nonce: '0x0',
    to: setting.toAddress,
    gas: setting.network.gas,
    gasPrice: setting.network.gasPrice,
    value: '0x1'
  }

  let account

  beforeEach(() => {
    account = caver.klay.accounts.create()
  })

  context('input: tx, privateKey', () => {
    it('should return signature and rawTransaction', async () => {
      const result = await caver.klay.accounts.signTransaction(
        txObj,
        account.privateKey
      )

      const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash']
      expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

      // recoverTransaction 결과와 address 비교
      expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
    })
  })

  context('input: tx:invalid address, privateKey', () => {
    it('should throw an error', async () => {
      // to address 누락 켸이스
      const invalid = Object.assign({}, txObj)
      delete invalid.to
      delete invalid.data

      const errorMessage = 'contract creation without any data provided'

      await expect(caver.klay.accounts.signTransaction(invalid, account.privateKey))
        .to.be.rejectedWith(errorMessage)
    })
  })

  context('input: tx:invalid value, privateKey', async () => {
    it('should throw an error', async () => {
      const invalid = Object.assign({}, txObj)
      invalid.value = '0xzzzz'

      const errorMessage = `Given input "${invalid.value}" is not a number.`

      await expect(caver.klay.accounts.signTransaction(invalid, account.privateKey))
        .to.be.rejectedWith(errorMessage)
    })
  })

  context('input: tx, privateKey:invalid', () => {
    it('should throw an error', () => {
      const invalidPrivateKey = caver.utils.randomHex(31)    // 31bytes

      const errorMessage = 'Invalid private key'

      expect(() => caver.klay.accounts.signTransaction(txObj, invalidPrivateKey))
        .to.throw(errorMessage)
    })
  })

  context('input: tx, privateKey, callback', () => {
    it('should return signature and rawTransaction', (done) => {
      caver.klay.accounts.signTransaction(
        txObj,
        account.privateKey,
        (error, result) => {
          const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash']
          expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

          // recoverTransaction 결과와 address 비교
          expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
          done()
        })
    })
  })
})

describe('caver.klay.accounts.recoverTransaction', () => {
  let account
  let rawTx

  beforeEach(async () => {
    account = caver.klay.accounts.create()

    const txObj = {
      nonce: '0x0',
      to: setting.toAddress,
      gas: setting.network.gas,
      gasPrice: setting.network.gasPrice,
      value: '0x1'
    }
    const signedTx = await account.signTransaction(txObj)
    rawTx = signedTx.rawTransaction
  })

  context('rawTransaction', () => {
    it('should return valid address', () => {
      const result = caver.klay.accounts.recoverTransaction(rawTx)
      expect(result).to.equal(account.address)
    })
  })

  context('rawTransaction:invalid', () => {
    it('should not equal to account.address', () => {
      const invalid = rawTx.slice(0, -2)
      const result = caver.klay.accounts.recoverTransaction(invalid)
      expect(result).to.not.equal(account.addrss)
    })
  })
})

describe('caver.klay.accounts.hashMessage', () => {
  it('result should be same with keccak256(MessagePrefix + originMessage.length + originMessage)', () => {
    const message = 'Hello World'
    let result = caver.klay.accounts.hashMessage(message)
    checkHashMessage(result, message)

    // Hex string 인 경우
    const decoded = caver.utils.utf8ToHex(message)
    result = caver.klay.accounts.hashMessage(decoded)
    checkHashMessage(result, message)
  })
})

describe('caver.klay.accounts.sign', () => {
  let account

  beforeEach(() => {
    account = caver.klay.accounts.create()
  })

  context('input: data, privateKey', () => {
    it('should recover valid address', () => {
      const data = 'Some data'
      let result = caver.klay.accounts.sign(data, account.privateKey)

      const keys = ['message', 'messageHash', 'v', 'r', 's', 'signature']
      expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

      if (data != result.message) {
        expect(data).to.equal(caver.utils.utf8ToHex(result.message))
      }

      const decoded = caver.utils.utf8ToHex(data)
      result = caver.klay.accounts.sign(decoded, account.privateKey)
      // messageHash 비교
      checkHashMessage(result.messageHash, data)

      // recover 결과값과 address 비교
      expect(caver.klay.accounts.recover(result)).to.equal(account.address)
    })
  })

  context('input: data, privateKey:invalid', () => {
    it('should throw an error', () => {
      const data = 'Some data'
      const invalid = caver.utils.randomHex(31)    // 31bytes

      const errorMessage = 'Invalid private key'
      expect(() => caver.klay.accounts.sign(data, invalid)).to.throw(errorMessage)
    })
  })
})

// caver.klay.accounts.recover
describe('caver.klay.accounts.recover', () => {
  let account

  beforeEach(() => {
    account = caver.klay.accounts.create()
  })

  context('input: signatureObject', () => {
    it('result should be same with account.address', () => {
      const message = 'Some data'
      const sigObj = account.sign(message)

      let result = caver.klay.accounts.recover(sigObj)
      expect(result).to.equal(account.address)
    })
  })

  context('input: message, signature', () => {
    it('result should be same with account.address', () => {
      const message = 'Some data'
      const sigObj = account.sign(message)

      let result = caver.klay.accounts.recover(sigObj.message, sigObj.signature)
      expect(result).to.equal(account.address)
    })
  })

  context('input: message, signature, prefixed', () => {
    it('result should be same with account.address', () => {
      const message = 'Some data'
      const sigObj = account.sign(message)
      const prefixed = true

      const messageHash = caver.klay.accounts.hashMessage(message)

      let result = caver.klay.accounts.recover(messageHash, sigObj.signature, prefixed)
      expect(result).to.equal(account.address)
    })
  })

  context('input: message, v, r, s', () => {
    it('result should be same with account.address', () => {
      const message = 'Some data'
      const sigObj = account.sign(message)

      let result = caver.klay.accounts.recover(sigObj.message, sigObj.v, sigObj.r, sigObj.s)
      expect(result).to.equal(account.address)
    })
  })

  context('input: message, v, r, s, prefixed', () => {
    it('result should be same with account.address', () => {
      const message = 'Some data'
      const sigObj = account.sign(message)
      const prefixed = true

      const messageHash = caver.klay.accounts.hashMessage(message)

      let result = caver.klay.accounts.recover(messageHash, sigObj.v, sigObj.r, sigObj.s, prefixed)
      expect(result).to.equal(account.address)
    })
  })
})

// caver.klay.accounts.encrypt
describe('caver.klay.accounts.encrypt', () => {
  let account

  beforeEach(() => {
    account = caver.klay.accounts.create()
  })

  context('input: privateKey, password', () => {
    it('should encrypt password with privateKey', () => {
      const password = 'klaytn!클레이튼@'

      let result = caver.klay.accounts.encrypt(account.privateKey, password)

      isKeystoreV3(result, account)

      const decryptedAccount = caver.klay.accounts.decrypt(result, password)
      isAccount(decryptedAccount, account)
    })
  })

  context('input: privateKey:invalid, password', () => {
    it('should throw an error', () => {
      const invalid = caver.utils.randomHex(31)    // 31bytes
      const password = 'klaytn!클레이튼@'

      const errorMessage = 'Invalid private key'
      expect(() => caver.klay.accounts.encrypt(invalid, password)).to.throw(errorMessage)
    })
  })
})

describe('caver.klay.accounts.decrypt', () => {
  let account

  beforeEach(() => {
    account = caver.klay.accounts.create()
  })

  context('input: keystoreJsonV3, password', () => {
    it('After decrypting, should return valid account', () => {
      const password = 'klaytn!클레이튼@'
      const keystoreJsonV3 = caver.klay.accounts.encrypt(account.privateKey, password)

      let result = caver.klay.accounts.decrypt(keystoreJsonV3, password)
      isKeystoreV3(keystoreJsonV3, result)

      // decrypt 후 비교
      isAccount(result, account)
    })
  })

  // CHECK : KLAYTN-52 Known Issue, 수정 전까지는 테스트 제외
  /*
  it('keystoreJsonV3, password:invalid [KLAYTN-52]', () => {
    const invalid = ''
    const keystoreJsonV3 = caver.klay.accounts.encrypt(account.privateKey, invalid)

    utils.log('input', keystoreJsonV3, invalid)

    const expectedError = {
      name: 'Error',
      message: ''
    }
    validateErrorCodeblock(() => caver.klay.accounts.decrypt(keystoreJsonV3, invalid), expectedError)
  })
  */
})

describe('caver.klay.accounts.wallet', () => {

  it('should return valid wallet instance', () => {
    let result = caver.klay.accounts.wallet
    isWallet(result)

    // wallet 에 1~10 개의 account 추가 후 wallet에 정상적으로 추가되었는지 확인
    const accounts = []
    const accountCount = Math.floor(Math.random() * 10) + 1
    for (let i = 0; i < accountCount; i++) {
      const account = caver.klay.accounts.create()
      accounts.push(account)
      caver.klay.accounts.wallet.add(account)
    }

    isWallet(result, { accounts })
  })
})

describe('caver.klay.accounts.wallet.create', () => {

  const validateCheckForWalletCreation = (result, numberOfAccounts) => {
    isWallet(result)
    expect(result.length).to.equal(numberOfAccounts)
    for (let i = 0; i < result.length; i++) {
      // index 로 조회한 account와 address 로 조회한 account 가 일치하는지 비교
      const accountByIndex = Object.assign({}, result[i])
      const accountByAddress = Object.assign({}, result[accountByIndex.address])

      delete accountByIndex.index
      delete accountByAddress.index

      isAccount(accountByIndex, { privateKey: accountByAddress.privateKey, address: accountByAddress.address })
      isAccount(accountByAddress, { privateKey: accountByIndex.privateKey, address: accountByIndex.address })
    }
  }

  context('input: numberOfAccounts', () => {
    it('should return valid wallet instance', () => {
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      let result = caver.klay.accounts.wallet.create(numberOfAccounts)
      validateCheckForWalletCreation(result, numberOfAccounts)
    })
  })

  context('input: numberOfAccounts:invalid', () => {
    it('should return 0 wallet', () => {
      const invalid = -1
      let result = caver.klay.accounts.wallet.create(invalid)
      validateCheckForWalletCreation(result, 0)
    })
  })

  context('input: numberOfAccounts, entropy', () => {
    it('should return valid wallet instance', () => {
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      const entropy = caver.utils.randomHex(32)

      let result = caver.klay.accounts.wallet.create(numberOfAccounts, entropy)
      validateCheckForWalletCreation(result, numberOfAccounts)
    })
  })
})

describe('caver.klay.accounts.wallet.add', () => {
  const validateCheckForWalletAddition = (data, { account, wallet }) => {
    const accounts = []  // 검증할 account object list

    // data 가 account object 맞는지 확인
    accounts.push(Object.assign({}, data))
    // wallet 에 추가되었는지 확인, index로 확인
    accounts.push(Object.assign({}, wallet[data.index]))
    // wallet 에 추가되었는지 확인, address로 확인
    accounts.push(Object.assign({}, wallet[data.address]))

    for (v of accounts) {
      delete v.index
      isAccount(v, { privateKey: account.privateKey, address: account.address })
    }
  }

  context('input: account', () => {
    it('should have valid wallet instance after addition', () => {
      // account 로 add
      let account = caver.klay.accounts.create()
      let result = caver.klay.accounts.wallet.add(account)

      validateCheckForWalletAddition(result, { account: account, wallet: caver.klay.accounts.wallet })

      // privateKey 로 add
      account = caver.klay.accounts.create()
      result = caver.klay.accounts.wallet.add(account.privateKey)

      validateCheckForWalletAddition(result, { account: account, wallet: caver.klay.accounts.wallet })
    })
  })

  context('input: account:invalid', () => {
    it('should throw an error', () => {
      const invalid = -1
      const errorMessage = 'Invalid private key'
      expect(() => caver.klay.accounts.wallet.add(invalid)).to.throw(errorMessage)
    })
  })
})

describe('caver.klay.accounts.wallet.remove', () => {

  const validateCheckForWalletRemove = (data, { expected=true, account, wallet }) => {
    // 결과값과 기대결과 비교
    expect(data).to.equal(expected)

    // remove 성공한 경우, wallet에서도 삭제되었는지 확인
    if (data) {
      expect(typeof wallet[account.address]).to.equal('undefined')
    }
  }

  context('input: account', () => {
    it('should remove wallet instance', () => {
      // wallet 에 1~5개 account 추가
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      caver.klay.accounts.wallet.create(numberOfAccounts)

      // 삭제할 account
      let account = caver.klay.accounts.wallet[Math.floor(Math.random() * numberOfAccounts)]

      // account 로 remove
      let result = caver.klay.accounts.wallet.remove(account.index)
      validateCheckForWalletRemove(result, { account: account, wallet: caver.klay.accounts.wallet })

      // account 다시 추가
      account = caver.klay.accounts.create()
      caver.klay.accounts.wallet.add(account.privateKey)

      // privateKey 로 remove
      result = caver.klay.accounts.wallet.remove(account.address)
      validateCheckForWalletRemove(result, { account: account, wallet: caver.klay.accounts.wallet })
    })
  })

  context('input: account:invalid', () => {
    it('should return false for removing invalid wallet instance index', () => {
      // wallet 에 1~5개 account 추가
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      caver.klay.accounts.wallet.create(numberOfAccounts)

      // index = -1 삭제 실패하는지 확인
      let invalid = -1
      let result = caver.klay.accounts.wallet.remove(invalid)
      validateCheckForWalletRemove(result, { expected: false })

      // index = wallet.length 삭제 실패하는지 확인
      invalid = numberOfAccounts
      result = caver.klay.accounts.wallet.remove(invalid)
      validateCheckForWalletRemove(result, { expected: false })
    })
  })
})

describe('caver.klay.accounts.wallet.clear', () => {
  context('input: no parameter', () => {
    it('should clear all wallet instance', () => {
      // wallet 에 1~5개 account 추가
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      caver.klay.accounts.wallet.create(numberOfAccounts)

      let result = caver.klay.accounts.wallet.clear()
      isWallet(result)
      expect(result.length).to.equal(0)
      expect(caver.klay.accounts.wallet.length).to.equal(0)

      // 빈 상태에서 다시 clear
      result = caver.klay.accounts.wallet.clear()
      isWallet(result)
      expect(result.length).to.equal(0)
      expect(caver.klay.accounts.wallet.length).to.equal(0)
    })
  })
})

describe('caver.klay.accounts.wallet.encrypt', () => {

  context('input: password', () => {
    it('should encrypted as v3Keystore', () => {
      const password = 'klaytn!클레이튼@'

      // wallet 에 1~5개 account 추가
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      caver.klay.accounts.wallet.create(numberOfAccounts)

      // password 로 wallet의 계정 encrypt
      let result = caver.klay.accounts.wallet.encrypt(password)

      expect(result.length).to.equal(caver.klay.accounts.wallet.length)
      result.forEach((v, i) => {
        isKeystoreV3(v, { address: caver.klay.accounts.wallet[i].address })
      })
      // decrypt 후 기존 wallet과 비교
      const decryptedWallet = caver.klay.accounts.wallet.decrypt(result, password)
      isWallet(decryptedWallet, { accounts: caver.klay.accounts.wallet })
    })
  })

  // CHECK : KLAYTN-52 Known Issue, 수정 전까지는 테스트 제외
  /*
  it('password:invalid [KLAYTN-52]', () => {
    const invalid = ''

    // wallet 에 1~5개 account 추가
    const numberOfAccounts = Math.floor(Math.random() * 5) + 1
    caver.klay.accounts.wallet.create(numberOfAccounts)

    // invalid password 로 wallet의 계정 encrypt
    utils.log('input', invalid)

    const expectedError = {
      name: 'Error',
      message: ''
    }
    validateErrorCodeblock(() => caver.klay.accounts.wallet.encrypt(invalid), expectedError)
  })
  */
})

describe('caver.klay.accounts.wallet.decrypt', () => {

  context('input: keystoreArray, password', () => {
    it('should decrypt v3Keystore to account instance', () => {
      const password = 'klaytn!클레이튼@'

      // wallet 에 1~5개 account 추가
      const numberOfAccounts = Math.floor(Math.random() * 5) + 1
      caver.klay.accounts.wallet.create(numberOfAccounts)

      // password 로 wallet의 계정 encrypt
      const encryptedKeystore = caver.klay.accounts.wallet.encrypt(password)

      const result = caver.klay.accounts.wallet.decrypt(encryptedKeystore, password)
      isWallet(result, { accounts: caver.klay.accounts.wallet })
    })
  })

  // CHECK : KLAYTN-52 Known Issue, 수정 전까지는 테스트 제외
  /*
  it('keystoreArray, password:invalid [KLAYTN-52]', () => {
    const invalid = ''

    // wallet 에 1~5개 account 추가
    const numberOfAccounts = Math.floor(Math.random() * 5) + 1
    caver.klay.accounts.wallet.create(numberOfAccounts)

    // password 로 wallet의 계정 encrypt
    const encryptedKeystore = caver.klay.accounts.wallet.encrypt(invalid)

    utils.log('input', encryptedKeystore, invalid)

    const expectedError = {
      name: 'Error',
      message: ''
    }
    validateErrorCodeblock(() => caver.klay.accounts.wallet.decrypt(encryptedKeystore, invalid), expectedError)
  })
  */
})
