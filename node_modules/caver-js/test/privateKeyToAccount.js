const { expect } = require('chai')
const testRPCURL = require('./testrpc')
const BN = require('bn.js')

describe('accounts.privateKeyToAccount', (done) => {
  it('should return same address even `0x` is missing', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const { address: address1 } = caver.klay.accounts.privateKeyToAccount(
      '0xd7a522fd98344f2f0a0515949ba610c6e9f8bf39266256d964078da9960527d5')
    const { address: address2 } = caver.klay.accounts.privateKeyToAccount(
      'd7a522fd98344f2f0a0515949ba610c6e9f8bf39266256d964078da9960527d5')

    expect(address1).to.equal(address2)
  })

  it('if `0x` prefix is used the length of privateKey should be 66', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const wrongPrivateKey = caver.utils.randomHex(33) // 0x prefixed, 64 length.
    expect(() => caver.klay.accounts.privateKeyToAccount(wrongPrivateKey)).to.throw()
  })
})
