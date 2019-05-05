var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")
var utils = require('../../../../caver-utils')
var helpers = require('../../../../caver-core-helpers')

const {
  VALUE_TRANFSER_TYPE_TAG,
  VALUE_TRANSFER_MEMO_TYPE_TAG,
  FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
  FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
  FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
  FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
} = helpers.constants

function rlpEncodeForValueTransfer(transaction) {
  return RLP.encode([
    RLP.encode([
      VALUE_TRANFSER_TYPE_TAG,
      Bytes.fromNat(transaction.nonce),
      Bytes.fromNat(transaction.gasPrice),
      Bytes.fromNat(transaction.gas),
      transaction.to.toLowerCase(),
      Bytes.fromNat(transaction.value),
      transaction.from.toLowerCase(),
    ]),
    Bytes.fromNat(transaction.chainId || "0x1"),
    "0x",
    "0x"
  ])
}

// TODO:
function rlpEncodeForValueTransferMemo(transaction) {
  return RLP.encode([
    RLP.encode([
      VALUE_TRANSFER_MEMO_TYPE_TAG,
      Bytes.fromNat(transaction.nonce),
      Bytes.fromNat(transaction.gasPrice),
      Bytes.fromNat(transaction.gas),
      transaction.to.toLowerCase(),
      Bytes.fromNat(transaction.value),
      transaction.from.toLowerCase(),
      transaction.data,
    ]),
    Bytes.fromNat(transaction.chainId || "0x1"),
    "0x",
    "0x"
  ])
}

function rlpEncodeForFeeDelegatedValueTransfer(transaction) {
  if (transaction.feePayer) { // fee payer rlp encoding.
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
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
        FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  }
}

function rlpEncodeForFeeDelegatedValueTransferWithRatio(transaction) {
  if (transaction.feePayer) { // fee payer rlp encoding.
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
        from.toLowerCase(),
        feeRatio,
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  } else {
    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
        Bytes.fromNat(transaction.feeRatio)
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  }
}

function rlpEncodeForFeeDelegatedValueTransferMemo(transaction) {
  if (transaction.feePayer) { // fee payer rlp encoding.
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
        from.toLowerCase(),
        data,
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  } else {
    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
        transaction.data,
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  }
}

function rlpEncodeForFeeDelegatedValueTransferMemoWithRatio(transaction) {
  if (transaction.feePayer) { // fee payer rlp encoding.
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
        from.toLowerCase(),
        data,
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
        FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
        transaction.data,
        Bytes.fromNat(transaction.feeRatio),
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
  }
}

module.exports = {
  rlpEncodeForValueTransfer,
  rlpEncodeForValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransfer,
  rlpEncodeForFeeDelegatedValueTransferWithRatio,
  rlpEncodeForFeeDelegatedValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
}