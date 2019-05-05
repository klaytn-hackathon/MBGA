const { expect } = require('chai')

describe('caver.klay.signTransaction', (done) => {
  it('should return "raw", and "tx" property ', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver('http://satoshi.klaytn.com:8551')

    const txParams = {
      nonce: 0,
      from: '0xeaae853a8354358a7f78eeee9e16e32b661b3f26',
      gasPrice: '25000000000',
      gas: '21000',
      to: '0xEB014f8c8B418Db6b45774c326A0E64C78914dC0',
      value: "1000000000000000000",
    }

    caver.klay.signTransaction(txParams)
      .then(console.log)
  })
})
