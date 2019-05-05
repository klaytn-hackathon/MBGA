const testRPCURL = require('./testrpc')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

const { expect } = chai

describe('estimate gas', (done) => {
  const CONTENT_MAX_LENGTH = 1024 * 128

  it('should return number type result', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)
    const gasUsed = await caver.klay.estimateGas({
      to: '0xaece0c892bc18ae589c186ce3b83b664bed61e82',
      data: `0xc6888fa10000000000000000000000000000000000000000000000000000000000000003`
    })

    expect(gasUsed).to.be.a('number')
  })

  it('should throw an error if data size exceeding content max length', () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)
    expect(caver.klay.estimateGas({
      to: '0xaece0c892bc18ae589c186ce3b83b664bed61e82',
      data: `0x${'f'.repeat(CONTENT_MAX_LENGTH)}`,
    })).to.eventually.be.rejected
  })
})
