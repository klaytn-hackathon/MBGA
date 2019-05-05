const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const { expect } = chai

describe('get block with consensus info', (done) => {
  // it('Call on exist block', async () => {
  //  var Caver = require('../index.js')
  //  const caver = new Caver('http://satoshi.klaytn.com:8551')
  //  expect(await caver.klay.getBlockWithConsensusInfo('100')).to.exist
  // })

  // it('Call on "genesis" block tag', async () => {
  //   var Caver = require('../index.js')
  //   const caver = new Caver('http://aspen.klaytn.com')
  //   caver.klay.defaultBlock = 'genesis'
  //   const currentBlock = await caver.klay.getBlockNumber()
  //   expect(await caver.klay.getBlockWithConsensusInfo(currentBlock + 10000)).to.be.null
  // })

  it('Call on non-existent block', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const currentBlock = await caver.klay.getBlockNumber()
    console.log(await caver.klay.getBlockWithConsensusInfo(currentBlock + 10000))
    // expect(await caver.klay.getBlockWithConsensusInfo(currentBlock + 10000))
    //   .to.throw(`block ${currentBlock + 10000} not found`)
  })

  it('committee should be empty on earliest blockInfo', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const blockInfo = await caver.klay.getBlockWithConsensusInfo('earliest')
    expect(blockInfo.committee).to.be.empty
  })

  it('committee should be empty on genesis blockInfo', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const blockInfo = await caver.klay.getBlockWithConsensusInfo('genesis')
    expect(blockInfo.committee).to.be.empty
  })

  it('should show latest blockInfo without error (in satoshi full node)', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    const blockInfo = await caver.klay.getBlockWithConsensusInfo('latest')
    expect(blockInfo).to.exist
  })
  // it('should show latest blockInfo without error (in klaytn 0.4.1 node)', async () => {
  //   var Caver = require('../index.js')
  //   const caver = new Caver('http://aspen.klaytn.com')
  //   const blockInfo = await caver.klay.getBlockWithConsensusInfo('latest')
  //   expect(blockInfo).to.exist
  // })
  //
  it('should throw an error with `pending` parameter', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')
    return expect(caver.klay.getBlockWithConsensusInfo('pending')).to.eventually.be.rejected
  })
})
