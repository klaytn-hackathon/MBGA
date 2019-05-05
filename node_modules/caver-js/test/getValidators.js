const { expect } = require('chai')

describe('get validators', (done) => {
  it('should throw an error on "pending" tag', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    caver.klay.getValidators('pending')
      .then(() => done(false))
      .catch(() => done())
  })

  it('validators should not be an empty on "latest" tag', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const validators = await caver.klay.getValidators('latest')
    expect(validators).not.to.be.empty
  })

  it('validators should not be an empty on "earliest" tag', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const validators = await caver.klay.getValidators('earliest')
    expect(validators).not.to.be.empty
  })

  it('validators should not be an empty on "genesis" tag', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const validators = await caver.klay.getValidators('genesis')
    expect(validators).not.to.be.empty
  })

  it('could be called without parameters', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const validators = await caver.klay.getValidators()
    expect(validators).not.to.be.empty
  })
})
