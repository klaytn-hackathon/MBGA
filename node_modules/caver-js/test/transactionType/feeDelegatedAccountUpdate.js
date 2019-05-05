require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Account: Fee Delegated Account Update', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xc64f2cd1196e2a1791365b00c4bc07ab8f047b73152e4617c6ed06ac221a4b0c'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
      from: '0x636F6C696e320000000000000000000000000000',
      nonce: '0x0',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      publicKey: '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x21f901068019843b9ac9ff94636f6c696e320000000000000000000000000000b84502f842a04ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db3191a062ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40deff845f84325a0cd995d9dbe4d91594594efc6ff57d274fbccfad9d23db0f6c29ed2ac1a7e3c34a06b56867f07d6e2b4fada38063d2f1e69f630cd6c8c0a162ef2c0d579b8e95a2f9490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a031def43ef04fea76fedd2cbb5f851a2d7dc1d5f3046fa11d5b6b4f5a4001a68fa02677330b3e731e053b8c6ad4e44f190807420cf4decbaf98bb7ae73c4158c8c7')

  }).timeout(200000)
})
