const { expect } = require('./extendedChai')
const testRPCURL = require('./testrpc')


describe('Instantiating Contract instance ', () => {

  it('Should return number type network id', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    caver.klay.net.getId()
      .then((res) => {
        expect(res).be.a('number')
        done()
      })
  })

  it('Should return number type peer count', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)
    caver.klay.net.getPeerCount()
      .then((res) => {
        expect(res).be.a('number')
        done()
      })
  })
}).timeout(20000)
