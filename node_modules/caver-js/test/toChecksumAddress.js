const { expect } = require('chai')
const testRPCURL = require('./testrpc')

describe('Checksum address', (done) => {
  it('should convert to vaild checksum address', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const address1 = '0xc1912fee45d61c87cc5ea59dae31190fffff232d'
    const address2 = '0XC1912FEE45D61C87CC5EA59DAE31190FFFFF232D'

    expect(caver.utils.toChecksumAddress(address1))
      .to.equal('0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')

    expect(caver.utils.toChecksumAddress(address2))
      .to.equal('0xc1912fEE45d61C87Cc5EA59DaE31190FFFFf232d')
  })
})
