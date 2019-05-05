const { expect } = require('chai')
const testRPCURL = require('./testrpc')
const BN = require('bn.js')

describe('raw test', (done) => {
  it('raw1', async () => {

    const Caver = require('../index.js');

    var caver = new Caver('ws://satoshi.klaytn.com:8552')
  })
})
