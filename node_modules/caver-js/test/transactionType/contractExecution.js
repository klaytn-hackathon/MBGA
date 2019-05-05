require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Contract: Contract execution', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'SMART_CONTRACT_EXECUTION',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x636F6E7472616374000000000000000000000000',
      nonce: '0xb',
      data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0xa',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x30f89e0b19843b9ac9ff94636f6e74726163740000000000000000000000000a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a03fe110ba87a1577a008cc23ea49a10dd74f2d2eebd649ef3ad6680f2a39f9889a051b6132ae4211dc8dc90b1dce4bbfae7eb01d14bc7d7f546e2e31673b2d1577e')

  }).timeout(200000)
})
