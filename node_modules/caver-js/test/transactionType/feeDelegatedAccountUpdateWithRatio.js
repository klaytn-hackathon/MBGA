require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Account: Fee Delegated Account Update with ratio', () => {
  it('Sign transaction', async () => {
    const privateKey = '0x98275a145bc1726eb0445433088f5f882f8a4a9499135239cfb4040e78991dab'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
      from: '0x636f6c696E330000000000000000000000000000',
      nonce: '0x0',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      publicKey: '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
      feeRatio: 11,
      chainId: '0x1',
    }

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    const fee_payer_transaction = {
      type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
      senderRawTransaction: senderRawTransaction,
      feePayer: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal('0x22f901078019843b9ac9ff94636f6c696e330000000000000000000000000000b84502f842a0c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447a094c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b20bf845f84325a0e52b3083c6c674df92debc7eb3b8fc08e0be2b7a908400b6a54a408aa80016c5a03fc1a44880a62996654cf754882abe5c8ece50485c0e18be9ef2fb55fc8bda629490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a04f1f4fd1f969270c8975e97d340e17d0a3cd4ef8456dbd1c1daa9d86386c78d3a0112627d47fb311dbdb76aca487f2aa3d9b7c98ca2b97b5232d11907cbda9bb8f')

  }).timeout(200000)
})
