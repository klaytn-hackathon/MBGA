require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Contract: Fee Delegated Contract Execution With Ratio', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6E7472616374000000000000000000000000',
      nonce: 13,
      data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
      gas: '0x3b9ac9ff',
      gasPrice: '0x0',
      chainId: '0x1',
      feeRatio: 66,
      value: '0xa',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x32f8fb0d80843b9ac9ff94636f6e74726163740000000000000000000000000a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e42f845f84326a0a9079db7e8096c850b4d89a5fd88c5ec2e8f1692d8ff13e220a01584f3611847a0561f834b7f726f5eaeb64ffb86ebcdd4b0b8ada06ed0b160c47b9c6727b304f09433f524631e573329a550296f595c820d6c65213ff845f84325a03179c9de00713594735c637bef6bc58483b497c1131a5165e4a6d67fdd871571a00b919909cb5ff4badb04b3bfce78aedde5c91934331cea51826234db73b73145')

  }).timeout(200000)
})
