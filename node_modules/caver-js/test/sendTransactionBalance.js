const { expect } = require('chai')
const { errors } = require('../packages/caver-core-helpers')
const fetch = require('node-fetch')

describe('send transaction balance', (done) => {

  it('should be given transferred balance', (done) => {

    var Onit = require('../index.js')

    var onit1 = new Onit('http://aspen.klaytn.com')
    // sender
    onit1.klay.accounts.wallet.add(onit1.klay.accounts.create())
    fetch(`https://apiwallet.klaytn.com/faucet/?address=${onit1.klay.accounts.wallet[0].address}`)
      .then((res) => {
        // receiver
        onit1.klay.accounts.wallet.add(onit1.klay.accounts.create())
        onit1.klay.sendTransaction({
          from: onit1.klay.accounts.wallet[0].address,
          to: onit1.klay.accounts.wallet[1].address,
          value: onit1.utils.toPeb('1', 'KLAY'),
          chainId: '1000',
          gas: '50000',
        })
          .once('receipt', (receipt) => {
            onit1.klay.getBalance(onit1.klay.accounts.wallet[1].address)
              .then(balance => {
                console.log('receiving address pvKey:' + onit1.klay.accounts.wallet[1].privateKey)
                console.log('receiving address:' + onit1.klay.accounts.wallet[1].address)
                console.log(balance, 'balance')
                expect(balance).to.not.eql('0x0')
                done()
              })
              .catch(done)
          })
      })
      .catch((err) => {
        console.log("HHH")
        console.log(err)
        done()
      })
  }).timeout(100000)
})
