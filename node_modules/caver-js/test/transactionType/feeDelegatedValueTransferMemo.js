require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Fee Delegated Value Transfer Memo', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      nonce: '0x5',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0x989680',
      chainId: '0x1',
      data: '0x68656c6c6f',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x11f8de0519843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6ff845f84325a028dc6454a57e6e9ae75760238fe4a791095f7acec08c097182cc70c07cc4af4fa0143c38af597ea5e88021ad1652b2b7373c0650d45f1c59927fabb85b75dbfe5d9433f524631e573329a550296f595c820d6c65213ff845f84325a0c95c415de41ba4b4098edd4b5405e39b486878a953c512507ce80126a78f9f0ea0699aca3c3a4deacc9629359a40a5aa1f51a9bbb909131c68a33e0a708276536b')

  }).timeout(200000)
})
