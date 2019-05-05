const { expect } = require('chai')
const testRPCURL = require('./testrpc')
const BN = require('bn.js')

describe('sha3', (done) => {
  it('should not throw an error when argument is number type', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    expect(() => caver.utils.sha3(234)).not.to.throw()

    expect(() => caver.utils.sha3(0xea)).not.to.throw()

    expect(() => caver.utils.sha3(new BN('234'))).not.to.throw()
  })

  it('should return null when argument is number type', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    expect(caver.utils.sha3(234)).to.equal(null)

    expect(caver.utils.sha3(0xea)).to.equal(null)
  })

  it('sha3(number string) should return same result with sha3(bignumber instance)', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    expect(caver.utils.sha3('234')).to.equal(caver.utils.sha3(new BN('234')))
  })
})
