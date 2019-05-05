require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Cancel: Cancel transaction', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'CANCEL',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      nonce: '0xe',
      gasPrice: '0x19',
      gas: '0x3b9ac9ff',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x38f8630e19843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0626eff19976452915d2a8c0538e562d4cada07df28818732555028faa820f664a07b2d3a24c805898f2ab876646ed52311928aae7170ed684a1dc61f73cdca8797')

  }).timeout(200000)
})
