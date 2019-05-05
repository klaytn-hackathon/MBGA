require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Fee Delegated Value Transfer With Ratio', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      nonce: '0x3',
      gas: '0x3b9ac9ff',
      feeRatio: 20,
      gasPrice: '0x19',
      value: '0x989680',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x0af8d90319843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e14f845f84326a0fee9ac41e3e9840549d2d27e4bee763e539c4caaeefcd2b2a139fde131042c25a007237d7a7b9cd622bd53e4c6073d9ae6089898f6fce8484eaf3e835e59d1c9049433f524631e573329a550296f595c820d6c65213ff845f84325a0aac7918a35ae8500e851c5902e156a173c7aacde21ad81fabe58e7f4e2ce4871a027a129c39c0e0ada879c461c2104738fd893bcecd6f03919c8a1e040b45bb422')

  }).timeout(200000)
})
