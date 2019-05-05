const { expect } = require('chai')
const fetch = require('node-fetch')

describe('get transaction count', () => {
  it('should not throw an error with "genesis" default block', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const firstTx = await caver.klay.getTransactionFromBlock(
      'genesis',
      0,
    )
    expect(firstTx).to.equal(null)
  }).timeout(100000)

  it('should not throw an error with "earliest" default block', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const firstTx = await caver.klay.getTransactionFromBlock(
      'earliest',
      0,
    )
    expect(firstTx).to.equal(null)
  }).timeout(100000)

  it('should not throw an error with "latest" default block', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const firstTx = await caver.klay.getTransactionFromBlock(
      'latest',
      0,
    )
    expect(() => firstTx).not.to.throw()
  }).timeout(100000)

  it('After sending transction, first tx should exist on the block', async () => {
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
        receipt.blockNumber
        const firstTx = await caver.klay.getTransactionFromBlock(
          receipt.blockNumber,
          0,
        )
        expect(firstTx).not.to.equal(null)
      })
  }).timeout(100000)
})
