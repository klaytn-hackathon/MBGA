require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Contract: Fee Delegated Contract Execution', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6E7472616374000000000000000000000000',
      nonce: 12,
      value: '0xa',
      data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
      gas: '0x3b9ac9ff',
      gasPrice: '0x0',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x31f8f90c80843b9ac9ff94636f6e74726163740000000000000000000000000a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33ef844f84225a06bb2d859b93a71fd047ce28c1092b86f632dd10d5083f3f4a2a6246f59c7fd539f9de8794365475939fae8f3d4ee1a36c6c4b097dd84768c58139ed52b7139cd9433f524631e573329a550296f595c820d6c65213ff845f84326a094f84b7e0dd4821d273e6099e949426687ec0accabc637fe9cbfafb780fdc513a0277f8a80a87cfec50b26f9c58184e638742236fe4efdeac3e47b22d0f10a33da')

  }).timeout(200000)
})
