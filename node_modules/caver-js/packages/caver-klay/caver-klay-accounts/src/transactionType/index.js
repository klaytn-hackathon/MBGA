const { rlpEncodeForLegacyTransaction } = require('./legacy')

const {
  rlpEncodeForValueTransfer,
  rlpEncodeForValueTransferMemo,
  
  rlpEncodeForFeeDelegatedValueTransfer,
  rlpEncodeForFeeDelegatedValueTransferWithRatio,
  rlpEncodeForFeeDelegatedValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
} = require('./valueTransfer')

const {
  rlpEncodeForAccountCreation,
  rlpEncodeForAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdateWithRatio,
} = require('./account')

const {
  rlpEncodeForContractDeploy,
  rlpEncodeForContractExecution,
  rlpEncodeForFeeDelegatedSmartContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,
  rlpEncodeForFeeDelegatedSmartContractExecution,
  rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,
} = require('./contract')

const {
  rlpEncodeForCancel,
  rlpEncodeForFeeDelegatedCancel,
  rlpEncodeForFeeDelegatedCancelWithRatio,
} = require('./cancel')

const {
  rlpEncodeForChainDataAnchoring,
} = require('./serviceChain')

module.exports = {
  // 1. legacy
  rlpEncodeForLegacyTransaction,
  // 2. value transfer
  rlpEncodeForValueTransfer,
  rlpEncodeForValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransfer,
  rlpEncodeForFeeDelegatedValueTransferWithRatio,
  rlpEncodeForFeeDelegatedValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
  // 3. account
  rlpEncodeForAccountCreation,
  rlpEncodeForAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdateWithRatio,
  // 4. contract
  rlpEncodeForContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,
  rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,
  
  rlpEncodeForContractExecution,
  rlpEncodeForFeeDelegatedSmartContractExecution,
  // 5. cancel
  rlpEncodeForCancel,
  rlpEncodeForFeeDelegatedCancel,
  rlpEncodeForFeeDelegatedCancelWithRatio,
  // 6. service chain
  rlpEncodeForChainDataAnchoring,
}