const { expect } = require('chai')
const testRPCURL = require('./testrpc')
const BN = require('bn.js')

describe('getPastLogs', (done) => {
  it('should contain id and removed field', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    caver.klay.getPastLogs({
      fromBlock: '0x0',
      address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b'
    })
  })

  it('should not throw an error with number type `fromBlock`', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    caver.klay.getPastLogs({
      fromBlock: 1,
      address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b'
    })
  })

  it('should not throw an error with number type `toBlock`', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    caver.klay.getPastLogs({
      toBlock: 1000,
      address: '0x9aa91c689248b0111dc756d7d505af4c2ff6be1b'
    })
  }).timeout(100000)
})
