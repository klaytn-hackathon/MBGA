var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")
var utils = require('../../../../caver-utils')
var helpers = require('../../../../caver-core-helpers')

const {
  CANCEL_TYPE_TAG,
  FEE_DELEGATED_CANCEL_TYPE_TAG,
  FEE_DELEGATED_CANCEL_WITH_RATIO_TYPE_TAG
} = helpers.constants

function rlpEncodeForCancel(transaction) {

  return RLP.encode([
      RLP.encode([
        CANCEL_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.from.toLowerCase(),
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x",
    ])
}

function rlpEncodeForFeeDelegatedCancel(transaction) {
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, from, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_CANCEL_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        from.toLowerCase(),
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
    
  } else {

    return RLP.encode([
        RLP.encode([
          FEE_DELEGATED_CANCEL_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.from.toLowerCase(),
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

function rlpEncodeForFeeDelegatedCancelWithRatio(transaction) {
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, from, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_CANCEL_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        from.toLowerCase(),
        Bytes.fromNat(feeRatio),
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
    
  } else {

    return RLP.encode([
        RLP.encode([
          FEE_DELEGATED_CANCEL_WITH_RATIO_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.from.toLowerCase(),
          Bytes.fromNat(transaction.feeRatio),
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

module.exports = {
  rlpEncodeForCancel,
  rlpEncodeForFeeDelegatedCancel,
  rlpEncodeForFeeDelegatedCancelWithRatio,
}