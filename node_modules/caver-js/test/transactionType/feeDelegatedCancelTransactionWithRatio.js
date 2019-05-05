require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Cancel: Fee Delegated Cancel Transaction With Ratio', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6E7472616374000000000000000000000000',
      nonce: 16,
      gas: '0x3b9ac9ff',
      gasPrice: '0x0',
      chainId: '0x1',
      feeRatio: 88,
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x3af8c01080843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33e58f845f84325a0b2af5e8d245f3832f2a08475b5410b59e2a62d7a4d0f68a6ff9efbb057ca3b5aa0622214af859315cb0ea8750f27fc076a293b06c6f3ace05ef19a63d7fbb621489433f524631e573329a550296f595c820d6c65213ff845f84325a09eeb92d4dc4ac12ea3612efe8d8b619f1d6bed9d5868d9a6fff0bab751ac89f5a07c12d76928ea9bc746ba3df8e429c48c8753947553bdfcf05ec51e7db7ade2b2')

  }).timeout(200000)
})
