require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Value transfer: Value Transfer With Memo', () => {
  it('Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const sender_transaction = {
      type: 'VALUE_TRANSFER_MEMO',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      nonce: '0x4',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      value: '0x989680',
      data: '0x68656c6c6f',
      chainId: '0x1',
    }

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal('0x10f8820419843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6ff845f84326a0eaa1cf4fd993bdc33e724d9c101b948ada698e1265ae9000151643c814dc3974a050d3db41bca1d5515cb3ef7996f0a9a367d7022e5739ed4cfc376d314c5ccb1c')

  }).timeout(200000)
})
