require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Account: Account creation', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)
    
    const publicKey = '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2'

    const sender_transaction = {
      type: 'ACCOUNT_CREATION',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6C696e000000000000000000000000000000',
      humanReadable: true,
      publicKey,
      nonce: '0x7',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0x174876e800',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x18f8c60719843b9ac9ff94636f6c696e00000000000000000000000000000085174876e8009490b3e9a3770481345a7f17f22f16d020bccfd33e01b84502f842a0c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447a094c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2f845f84326a0964aea0c083c7d31a1ec8ca8013b901aafd52bf6f563b27c19e4c4605c099ab2a023ba1cd1847eb0a974a5e7acb729dbe229b45e301be4e449d0695010df4749d9')

  }).timeout(200000)
})
