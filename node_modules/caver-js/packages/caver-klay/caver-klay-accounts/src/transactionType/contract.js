var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")
var utils = require('../../../../caver-utils')
var helpers = require('../../../../caver-core-helpers')

const {
  SMART_CONTRACT_DEPLOY_TYPE_TAG,
  SMART_CONTRACT_EXECUTION_TYPE_TAG,
  FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
  FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
  FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
  FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
} = helpers.constants

function rlpEncodeForContractDeploy(transaction) {

  return RLP.encode([
      RLP.encode([
        SMART_CONTRACT_DEPLOY_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.from.toLowerCase(),
        transaction.data,
        Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x",
    ])
}

function rlpEncodeForContractExecution(transaction) {

  return RLP.encode([
      RLP.encode([
        SMART_CONTRACT_EXECUTION_TYPE_TAG,
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
      "0x",
    ])
}

function rlpEncodeForFeeDelegatedSmartContractDeploy(transaction) {
    
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, humanReadable, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
        from.toLowerCase(),
        data,
        humanReadable,
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
    
  } else {

    return RLP.encode([
        RLP.encode([
          FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.to.toLowerCase(),
          Bytes.fromNat(transaction.value),
          transaction.from.toLowerCase(),
          transaction.data,
          Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

function rlpEncodeForFeeDelegatedSmartContractDeployWithRatio(transaction) {
    
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, humanReadable, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        to.toLowerCase(),
        Bytes.fromNat(value),
        from.toLowerCase(),
        data,
        humanReadable,
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
          FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.to.toLowerCase(),
          Bytes.fromNat(transaction.value),
          transaction.from.toLowerCase(),
          transaction.data,
          Bytes.fromNat(transaction.humanReadable === true ? '0x1' : '0x0'),
          Bytes.fromNat(transaction.feeRatio),
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

function rlpEncodeForFeeDelegatedSmartContractExecution(transaction) {
    
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
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
          FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG,
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
        "0x",
      ])
  }
}

function rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio(transaction) {
    
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, to, value, from, data, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
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
          FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG,
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
        "0x",
      ])
  }
}

module.exports = {
  rlpEncodeForContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,
  
  rlpEncodeForContractExecution,
  rlpEncodeForFeeDelegatedSmartContractExecution,
  rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,
}