require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Value Transfer', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'VALUE_TRANSFER',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      nonce: '0x1',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0x989680',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x08f87c0119843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a079793f7c580e206b08fd6997df2bbeb89726fa9830c79231adb1b8aba40099f5a07a84e1833cc7ab78300e72bed861ee9b20f52709a8ea43d3d20ffec1c723e1d0')

  }).timeout(200000)
})
