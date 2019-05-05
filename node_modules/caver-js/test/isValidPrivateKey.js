const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.utils.isValidPrivateKey', (done) => {
  it('should return false when given private key is invalid.', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    expect(caver.utils.isValidPrivateKey(1234)).to.equal(false)
    expect(caver.utils.isValidPrivateKey('1234')).to.equal(false)
    expect(caver.utils.isValidPrivateKey('zzzz')).to.equal(false)
    expect(caver.utils.isValidPrivateKey('aaaa')).to.equal(false)

    expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140')).to.equal(true)
    expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140FF')).to.equal(false)
    expect(caver.utils.isValidPrivateKey('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140')).to.equal(true)
    expect(caver.utils.isValidPrivateKey('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140'.toLowerCase())).to.equal(true)
    expect(caver.utils.isValidPrivateKey('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140'.toLowerCase())).to.equal(true)
  })
})
