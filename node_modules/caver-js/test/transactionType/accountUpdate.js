require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Account: Account update', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xed580f5bd71a2ee4dae5cb43e331b7d0318596e561e6add7844271ed94156b20'

    caver.klay.accounts.wallet.add(privateKey)
    
    const publicKey = '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def'

    const sender_transaction = {
      type: 'ACCOUNT_UPDATE',
      from: '0x636F6C696e000000000000000000000000000000',
      publicKey,
      nonce: '0x0',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x20f8aa8019843b9ac9ff94636f6c696e000000000000000000000000000000b84502f842a04ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db3191a062ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40deff845f84325a06c29d249db733715182dc143c9e9d6a334b60e904a88dfee28e69f1c157d245aa006ae16c0f11b18286b6a73af124b3cd18a89a3ba58f0953ef32493fc6d335982')

  }).timeout(200000)
})
