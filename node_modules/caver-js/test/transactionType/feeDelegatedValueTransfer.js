require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Fee Delegated Value Transfer', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      nonce: '0x2',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0x989680',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x09f8d80219843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a089bb7f66d87c72554beb2f4b9255f864a92866476932793ed755e95164e1679fa075fb8f74bf6f1ff35b15d889bc533502ce0dc68a0a0e1f106c566086b647530b9433f524631e573329a550296f595c820d6c65213ff845f84325a0d08b5ebd1323c3bcca6763994832e59172e06d5114cc6ea76c4a4f4f6f04f565a04a6b885dc4c5251f47326c97075274276c9f1c8098b8f42a3d03e6d4cb2faf3e')

  }).timeout(200000)
})
