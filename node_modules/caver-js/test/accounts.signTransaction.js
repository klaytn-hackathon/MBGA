const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.klay.accounts.signTransaction', () => {
  it('should be rejected when data field is missing for contract creation tx', () => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const { privateKey } = caver.klay.accounts.create()

    const tx = {
      value: '1000000000',
      gas: 2000000,
    }

    expect(caver.klay.accounts.signTransaction(tx, privateKey)).to.eventually.rejected
  })
})
