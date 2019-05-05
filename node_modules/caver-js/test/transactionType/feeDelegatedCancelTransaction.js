require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Cancel: Fee Delegated Cancel Transaction', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_CANCEL',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6E7472616374000000000000000000000000',
      nonce: 15,
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_CANCEL',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x33f524631e573329a550296F595c820D6c65213f',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x39f8bf0f19843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a04309d80412c206e604771e2a4b15017f2a0bdfc1f1dd28c9c63dabdc7e8d9ff0a05b98c2c1bb2faae610f791e424444664d6f18d8ed8787bfe66ea6672d974ef349433f524631e573329a550296f595c820d6c65213ff845f84325a062fbaa9cf65a57f61dd680e13f93cacf8ea064211f111cae11222cae6fdfde77a060df7c7b9958d2e10568df83a8e84e7c73b4549075957c344a7848d16fd34915')

  }).timeout(200000)
})
