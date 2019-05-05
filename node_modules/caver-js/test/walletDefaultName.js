const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('wallet instance default wallet name', (done) => {
  it('should return valid default wallet name', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    expect(caver.klay.accounts.wallet.defaultKeyName).to.equal('caverjs_wallet')
  })
})
