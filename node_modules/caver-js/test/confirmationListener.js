const { expect } = require('chai')
const fetch = require('node-fetch')

describe('send transaction with confirmation listener', (done) => {
  it('confirmation listener should not work', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')

    // 1. Create sender address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    // 2. Create receiver address
    caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    fetch(`https://apiwallet.klaytn.com/faucet/?address=${caver.klay.accounts.wallet[0].address}`)
      .then(() => {
        const sent = caver.klay.sendTransaction({
          from: caver.klay.accounts.wallet[0].address,
          to: caver.klay.accounts.wallet[1].address,
          value: caver.utils.toPeb('1', 'KLAY'),
          chainId: '1000',
          gas: '50000',
        })
          .on('confirmation', (nothingHappend) => {
            expect(nothingHappend).to.equal(null)
            done()
          })

        // If nothing happened during 10s,
        // We can gurantee 'confirmation' listener doesn't working.
        setTimeout(() => {
          // Emit "Nothing happened"
          sent.emit('confirmation', null)
          done()
        }, 10000)
      })
      .catch(() => done())

  }).timeout(20000)
})
