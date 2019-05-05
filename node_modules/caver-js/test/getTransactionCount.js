const { expect } = require('chai')
const fetch = require('node-fetch')

const _checkTransactionCount = async (defaultBlock, expectedValue, done) => {
  var Caver = require('../index.js')
  const caver = new Caver('http://aspen.klaytn.com')

  // 1. Create sender address
  const { address: senderAddress, privateKey } = caver.klay.accounts.create()
  if (!senderAddress) return
  caver.klay.accounts.wallet.add(privateKey)
  // 2. Create receiver address
  caver.klay.accounts.wallet.add(caver.klay.accounts.create())

  const res = await fetch(`https://apiwallet.klaytn.com/faucet/?address=${senderAddress}`)
  const faucetResult = await res.json()
  if (faucetResult.status !== 'ok') {
    console.log('Faucet does not worked properly. Please retry.')
    return
  }

  const balance = await caver.klay.getBalance(senderAddress)

  if (balance < 50) {
    console.log('Faucet does not worked properly. Please retry.')
    done(false)
    return
  }

  caver.klay.sendTransaction({
    from: senderAddress,
    to: caver.klay.accounts.wallet[1].address,
    value: caver.utils.toPeb('1', 'KLAY'),
    chainId: '1000',
    gas: '50000',
  })
    .once('receipt', async (receipt) => {
      const txCount = await caver.klay.getTransactionCount(
        caver.klay.accounts.wallet[0].address,
        defaultBlock,
      )
      expect(txCount).to.equal(expectedValue)
      done()
    })
    .catch(done)
}

describe('get transaction count', () => {
  it('should not throw an error with "genesis" default block', (done) => {
    _checkTransactionCount('genesis', 0, done)
  }).timeout(100000)

  it('should not throw an error with "earliest" default block', (done) => {
    _checkTransactionCount('earliest', 0, done)
  }).timeout(100000)

  it('should not throw an error with "pending" default block', (done) => {
    _checkTransactionCount('pending', 1, done)
  }).timeout(100000)

  it('should not throw an error with "latest" default block', (done) => {
    _checkTransactionCount('latest', 1, done)
  }).timeout(100000)
})
