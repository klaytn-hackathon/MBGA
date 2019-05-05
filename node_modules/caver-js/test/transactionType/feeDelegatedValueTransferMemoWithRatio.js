require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Fee Delegated Value Transfer Memo With Ratio', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
      from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
      to: '0x75c3098be5e4b63fbac05838daaee378dd48098d',
      nonce: '0x6',
      gas: '0x3b9ac9ff',
      feeRatio: 30,
      data: '0x68656c6c6f',
      gasPrice: '0x19',
      value: '0x989680',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x12f8df0619843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6f1ef845f84326a0f8284ce7dc9d7adbcb1c0ad1a80b12995eae39415927827f2020cb34d141bc9ea074a388f86ec887a94873c472f5bd22ec91051765f059ef250411f1aeda6daa159433f524631e573329a550296f595c820d6c65213ff845f84325a0e701b6ceaab17fbbe745edd32e26deb752468f0b2f5614372bce2098e3101baea06f4192982e093e604b64933fc942c94d6cf2ecbe285fffd35488308bae6b9f51')

  }).timeout(200000)
})
