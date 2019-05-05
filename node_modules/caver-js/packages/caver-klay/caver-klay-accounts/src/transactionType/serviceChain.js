var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")
var utils = require('../../../../caver-utils')
var helpers = require('../../../../caver-core-helpers')

const {
  CHAIN_DATA_ANCHROING_TYPE_TAG,
} = helpers.constants

function rlpEncodeForChainDataAnchoring(transaction) {

  return RLP.encode([
      RLP.encode([
        CHAIN_DATA_ANCHROING_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
        Bytes.fromNat(transaction.anchoredData),
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x",
    ])
}

module.exports = {
  rlpEncodeForChainDataAnchoring,
}