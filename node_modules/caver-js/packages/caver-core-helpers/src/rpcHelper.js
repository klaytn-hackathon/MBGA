const rpc = require('../../../rpc.json')
const Method = require('../../caver-core-method')

// Raw RPC means, it is not instance of 'Method' from `caver-core-method` module.
const extractedRawRPC = (() => {
  return rpc.reduce((acc, cur) => {
    if (!cur.name) return acc
    acc[cur.name] = cur
    return acc
  }, {})
})()

module.exports = {
  extractedRawRPC,
}
