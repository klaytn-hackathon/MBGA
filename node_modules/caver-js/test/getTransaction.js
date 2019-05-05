const { expect } = require('chai')
const testRPCURL = require('./testrpc')
const fetch = require('node-fetch')

describe('get transaction', (done) => {
  it('should be same with getTransactionFromBlock output format', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    // 1. Create sender address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    // 2. Create receiver address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    let txHash

    fetch(`https://apiwallet.klaytn.com/faucet/?address=${caver.klay.accounts.wallet[0].address}`)
      .then(() => {
        const sent = caver.klay.sendTransaction({
          from: caver.klay.accounts.wallet[0].address,
          to: caver.klay.accounts.wallet[1].address,
          value: caver.utils.toPeb('1', 'KLAY'),
          chainId: '1000',
          gas: '50000',
        })
          .on('transactionHash', (_txHash) => {
            txHash = _txHash
          })
          .on('receipt', async (receipt) => {
            const transaction1 = await caver.klay.getTransaction(txHash)
            const transaction2 = await caver.klay.getTransactionFromBlock(receipt.blockHash, 0)
            expect(typeof transaction1.blockNumber === typeof transaction2.blockNumber).to.be.true
            expect(typeof transaction1.gas === typeof transaction2.gas).to.be.true
            expect(typeof transaction1.nonce === typeof transaction2.nonce).to.be.true
            expect(typeof transaction1.transactionIndex === typeof transaction2.transactionIndex).to.be.true
          })
      })
  }).timeout(10000)
})
