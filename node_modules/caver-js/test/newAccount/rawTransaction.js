require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')
const { encodeRLPByTxType, makeRawTransaction } = require('../../packages/caver-klay/caver-klay-accounts/src/makeRawTransaction')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Demo scenario', () => {
  it('2. Should send value transfer transaction with the account created from step 1.', (done) => {
    const toshiPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
    caver.klay.accounts.wallet.add(toshiPrivateKey)

    const transaction = {
      type: 'VALUE_TRANSFER',
      from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
      nonce: '0x1',
      to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
      gasPrice: '0x19',
      gas: '0x3b9ac9ff',
      value: '0x989680',
      chainId: '0x1',
    }

    const rlpEncoded = encodeRLPByTxType(transaction)
    console.log('rlp: ', rlpEncoded)

    caver.klay.accounts.signTransaction(transaction, toshiPrivateKey)
      .then(console.log)

    // makeRawTransaction(rlpEncoded, transaction)
    // makeRawTransaction

    // caver.klay.sendTransaction(transaction)
    //   .on('transactionHash', console.log)
    //   .on('receipt', async (receipt) => {
    //     console.log(receipt)
    //     const toshiAccountBalance = await caver.klay.getBalance('toshi')
    //     console.log(
    //       'caver.klay.getBalance("toshi"): ' +
    //       caver.utils.fromPeb(toshiAccountBalance, 'KLAY') +
    //       ' KLAY'
    //     )
    //     done()
    //   })
    //   .on('error', console.log)
  }).timeout(200000)
})
