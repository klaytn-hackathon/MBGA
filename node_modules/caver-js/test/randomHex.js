const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')
const BN = require('bn.js')

describe('utils.randomHex', (done) => {
  it('Should throw an error with out of range size', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const tooLowSize = -1
    const tooHighSize = 65537

    expect(() => caver.utils.randomHex(tooLowSize)).throw()
    expect(() => caver.utils.randomHex(tooHighSize)).throw()
  })
})
