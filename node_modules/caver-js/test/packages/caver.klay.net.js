const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const setting = require('./setting')
const Caver = require('../../index.js')

let caver
beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('caver.klay.net.getId', () => {
  context('input: no parameter', () => {
    it('should return networkId set in setting.js', async () => {
      const networkId = await caver.klay.net.getId()
      expect(networkId).to.be.a('number')
      expect(networkId).to.be.equal(setting.networkId)
    })
  })

  context('input: callback', () => {
    it('should return networkId set in setting.js', (done) => {
      caver.klay.net.getId((err, data) => {
        const networkId = data
        expect(networkId).to.be.a('number')
        expect(networkId).to.be.equal(setting.networkId)
        done()
      })
    })
  })
})

describe('caver.klay.net.isListening', () => {
  context('input: no parameter', () => {
    it('should return boolean type', async () => {
      const isListening = await caver.klay.net.isListening()
      expect(isListening).to.be.a('boolean')
    })
  })

  context('input: callback', () => {
    it('should return boolean type', async () => {
      const isListening = await caver.klay.net.isListening()
      expect(isListening).to.be.a('boolean')
    })
  })
})

describe('caver.klay.net.getPeerCount', () => {
  context('input: no parameter', () => {
    it('should return peerCount set in setting.js', async () => {
      const peerCount = await caver.klay.net.getPeerCount()
      expect(peerCount).to.be.a('number')
      expect(peerCount).to.be.equal(setting.peerCount)
    })
  })
})
