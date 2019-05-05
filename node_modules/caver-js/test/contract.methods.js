const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('caver.klay.contract.methods', () => {
  it('options.gas', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver(testRPCURL)

    const helloContractABI = [ { "constant": true, "inputs": [], "name": "greetCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "greeting", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_greeting", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "greeting", "type": "string" }, { "indexed": true, "name": "greetCount", "type": "uint256" } ], "name": "greetevent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "cmd", "type": "string" }, { "indexed": false, "name": "input", "type": "uint256" }, { "indexed": true, "name": "greetCount", "type": "uint256" } ], "name": "countevent", "type": "event" }, { "constant": true, "inputs": [], "name": "getStatus", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_greeting", "type": "string" } ], "name": "setGreeting", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getGreeting", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_str", "type": "string" } ], "name": "echo", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [], "name": "greet", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "delta", "type": "uint256" } ], "name": "addCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "count", "type": "uint256" } ], "name": "setCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resetCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]

    const helloContractDeployedAddress = '0x7128c8ec37ff1faaa002b466970a3c6aec3d0eec'

    const contract = new caver.klay.Contract(helloContractABI, helloContractDeployedAddress)
    const { address } = caver.klay.accounts.wallet.add('0xc659a42e4423c6782346b182ccbd895d4a2135df85100a369054ab5d274dfa88')

    const options = {
      from: address,
      gas: 0,
    }

    // contract.methods.greet().call(options)
    // contract.methods.greet().send(options)
    // contract.methods.greet().estimateGas(options)
  })
}).timeout(100000)
