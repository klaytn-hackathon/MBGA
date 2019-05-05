const { expect } = require('chai')

describe('get block', (done) => {
  it('should have specific property', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const blockInfo = await caver.klay.getBlock(388150)
    expect(blockInfo.receiptsRoot).to.exist
  })

  it('should return null when calling on non-existent block', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const currentBlockNumber = await caver.klay.getBlockNumber()
    const block = await caver.klay.getBlock(currentBlockNumber + 10000)
    expect(block).to.be.null
  })
})
