const Count = artifacts.require('./DodoRepository.sol')
const fs = require('fs')

module.exports = function (deployer) {
  deployer.deploy(Dodo)
    .then(() => {
    // Record recently deployed contract address to 'deployedAddress' file.
    if (Dodo._json) {
      // Save abi file to deployedABI.
      fs.writeFile(
        'deployedABI',
        JSON.stringify(Dodo._json.abi, 2),
        (err) => {
          if (err) throw err
          console.log(`The abi of ${Dodo._json.contractName} is recorded on deployedABI file`)
        })
    }

    fs.writeFile(
      'deployedAddress',
      Dodo.address,
      (err) => {
        if (err) throw err
        console.log(`The deployed contract address * ${Dodo.address} * is recorded on deployedAddress file`)
    })
  })
}
