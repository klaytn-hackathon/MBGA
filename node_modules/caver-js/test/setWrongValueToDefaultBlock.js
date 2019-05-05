const { expect } = require('chai')

const abi = [{
  "type": "function",
  "name": "foo",
  "inputs": [{"name":"a","type":"uint256"}],
  "outputs": [{"name":"b","type":"address"}]
 },
 {
  "type":"event",
  "name":"Event",
  "inputs": [
    {"name":"a","type":"uint256","indexed":true},
    {"name":"b","type":"bytes32","indexed":false}
  ]
 }
]


describe('defaultBlock value should be set with valid value', (done) => {
  it('Set with valid value', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    expect(caver.klay.defaultBlock = '1000').to.exist
  })

  it('Set with invalid value 1', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    expect(() => caver.klay.defaultBlock = 'zzzzzz')
      .to.throw('Invalid default block number.')
  })

  it('Set with invalid value 2', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    expect(() => caver.klay.defaultBlock = '0xzzzzzz')
      .to.throw('Invalid default block number.')
  })

  it('Set with invalid value in contract', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    const { address } = caver.klay.accounts.create()
    const contract = new caver.klay.Contract(abi, address)
    expect(() => contract.defaultBlock = '0xzzzzzz')
      .to.throw('Invalid default block number.')
  })

  it('Set with invalid value in personal', async () => {
    var Caver = require('../index.js')
    const caver = new Caver('http://aspen.klaytn.com')
    expect(() => caver.klay.personal.defaultBlock = '0xzzzzzz')
      .to.throw('Invalid default block number.')
  })
})
