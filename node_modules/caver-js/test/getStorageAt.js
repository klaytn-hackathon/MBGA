const { expect } = require('chai')

describe('get storage at', (done) => {
  it('should not throw an error with string type parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const stroageInfo = await caver.klay.getStorageAt(
      '0x9e6df5dbc96b2d4f5bee35fd99d832361360c82a',
      '1',
    )
    expect(stroageInfo).to.exist
  })

  it('should not throw an error with number type parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const stroageInfo = await caver.klay.getStorageAt(
      '0x9e6df5dbc96b2d4f5bee35fd99d832361360c82a',
      1,
    )
    expect(stroageInfo).to.exist
  })
})
