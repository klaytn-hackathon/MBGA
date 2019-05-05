const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.klay.accounts.privateKeyToAccount', (done) => {
  it('should thrown an error when given private key length is less than 32 bytes.', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    expect(() => caver.klay.accounts.privateKeyToAccount('aaaa')).to.throw()
  })
})
