const { expect } = require('chai')
const fetch = require('node-fetch')

describe('caver middleware', () => {

  it('when sendTransaction, does it logs?', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')

    caver.use(caver.middleware.builtin.rpcFilter(
      ['klay_gasPrice'],
      'exclude'
    ))

    caver.use(caver.middleware.builtin.timeMeasure())

    caver.use(caver.middleware.builtin.fileLogger({
      path: './logs',
      name: 'rpcLogger'
    }))

    // 1. Create sender address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    // 2. Create receiver address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    caver.klay.getBlockNumber()
    caver.klay.getBlockNumber()

    const res = await fetch(`https://apiwallet.klaytn.com/faucet/?address=${caver.klay.accounts.wallet[0].address}`)
    caver.klay.sendTransaction({
      from: caver.klay.accounts.wallet[0].address,
      to: caver.klay.accounts.wallet[1].address,
      value: caver.utils.toPeb('1', 'KLAY'),
      chainId: '1000',
      gas: '50000',
    })
      .once('receipt', async (receipt) => {

      })
    caver.klay.getBlockNumber()
    caver.klay.getBlockNumber()
    caver.klay.getBlockNumber()
  }).timeout(100000)
})
