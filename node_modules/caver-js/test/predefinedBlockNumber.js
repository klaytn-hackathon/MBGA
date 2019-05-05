const { expect } = require('chai')

describe('Predefined block number', (done) => {
  it('genesis', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    caver.klay.defaultBlock = 'genesis'
    const { address } = caver.klay.accounts.create()
    expect(await caver.klay.getTransactionCount(address)).to.exist
  })

  it('latest', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    caver.klay.defaultBlock = 'latest'
    const { address } = caver.klay.accounts.create()
    expect(await caver.klay.getTransactionCount(address)).to.exist
  })

  it('earliest', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    caver.klay.defaultBlock = 'earliest'
    const { address } = caver.klay.accounts.create()
    expect(await caver.klay.getTransactionCount(address)).to.exist
  })

  it('pending', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    caver.klay.defaultBlock = 'pending'
    const { address } = caver.klay.accounts.create()
    expect(await caver.klay.getTransactionCount(address)).to.exist
  })
})
