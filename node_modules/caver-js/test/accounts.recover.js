const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.klay.accounts.recover', (done) => {
  it('should have same value for 3 different arguments definition', () => {

    /**
     * 3 different arguments definition for `caver.klay.accounts.recover`
     * a. recover with signed object.
     * b. recover with message, signature
     * c. recover with message, v, r, s
     */

    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const message = 'Some data'

    const privateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'
    const account = caver.klay.accounts.privateKeyToAccount(privateKey)

    const signed = caver.klay.accounts.sign('Some data', privateKey)

    const { signature, v, r, s } = signed

    expect(caver.klay.accounts.recover(signed)).to.equal(caver.klay.accounts.recover(message, signature))
    expect(caver.klay.accounts.recover(signed)).to.equal(caver.klay.accounts.recover(message, v, r, s))
  })

  it('messageHash argument can be used as a first argument with preFixed = true', () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const privateKey = '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318'
    const signed = caver.klay.accounts.sign('Some data', privateKey)

    const { messageHash, signature, v, r, s } = signed

    expect(caver.klay.accounts.recover(messageHash, signature, true)).to.equal(caver.klay.accounts.recover(signed))
  })
})
