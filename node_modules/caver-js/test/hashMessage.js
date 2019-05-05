const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.klay.accounts.hashMessage', (done) => {
  it('should have same value with utf8ToHex', async () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const rawStringHashed = caver.klay.accounts.hashMessage('Hello World')
    const hexStringHashed = caver.klay.accounts.hashMessage(caver.utils.utf8ToHex('Hello World'))
    expect(rawStringHashed).to.equal(hexStringHashed)
  })

  it('should have same value with caver.utils.sha3 containing prefix message', () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const rawMessage = 'Hello World'
    const rawStringHashed = caver.klay.accounts.hashMessage(rawMessage)
    const sha3StringHashed = caver.utils.sha3('\x19Klaytn Signed Message:\n' + rawMessage.length + rawMessage)

    expect(rawStringHashed).to.equal(sha3StringHashed)
  })
})
