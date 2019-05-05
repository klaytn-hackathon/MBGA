var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")

function rlpEncodeForLegacyTransaction(transaction) {
  return RLP.encode([
    Bytes.fromNat(transaction.nonce),
    Bytes.fromNat(transaction.gasPrice),
    Bytes.fromNat(transaction.gas),
    transaction.to.toLowerCase(),
    Bytes.fromNat(transaction.value),
    transaction.data,
    Bytes.fromNat(transaction.chainId || "0x1"),
    "0x",
    "0x",
  ])
}

module.exports = {
  rlpEncodeForLegacyTransaction,
}