const { expect } = require('chai')

describe('get block transaction count', (done) => {
  it('should not throw an error with "earliest" parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const blockTransactionCount = await caver.klay.getBlockTransactionCount(
      'earliest')
    expect(blockTransactionCount).to.exist
  })

  it('should not throw an error with "genesis" parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const blockTransactionCount = await caver.klay.getBlockTransactionCount(
      'genesis')
    expect(blockTransactionCount).to.exist
  })

  it('should not throw an error with "latest" parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const blockTransactionCount = await caver.klay.getBlockTransactionCount(
      'latest')
    expect(blockTransactionCount).to.exist
  })

  it('should not throw an error with "pending" parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const blockTransactionCount = await caver.klay.getBlockTransactionCount(
      'pending')
    expect(blockTransactionCount).to.exist
  })
})
