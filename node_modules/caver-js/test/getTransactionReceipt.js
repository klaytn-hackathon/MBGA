const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const fetch = require('node-fetch')

chai.use(chaiAsPromised)

const { expect } = chai

describe('get transaction receipt', (done) => {
  it('should have logsBloom property', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')

    let txHash = ''

    // 1. Create sender address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    // 2. Create receiver address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    const res = await fetch(`https://apiwallet.klaytn.com/faucet/?address=${caver.klay.accounts.wallet[0].address}`)
    caver.klay.sendTransaction({
      from: caver.klay.accounts.wallet[0].address,
      to: caver.klay.accounts.wallet[1].address,
      value: caver.utils.toPeb('1', 'KLAY'),
      chainId: '1000',
      gas: '50000',
    })
      .once('transactionHash', (transactionHash) => {
        txHash = transactionHash
      })
      .once('receipt', async (receipt) => {
        const txReceipt = await caver.klay.getTransactionReceipt(txHash)
        expect(txReceipt.logsBloom).to.exist
      })
  }).timeout(100000)

  it('should throw an error with invalid transaction hash', () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const invalidTxHash = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

    return expect(caver.klay.getTransactionReceipt(invalidTxHash)).to.eventually.be.rejected
  })
})
