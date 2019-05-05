const { expect } = require('./extendedChai')

const websocketURL = require('./testWebsocket')

describe('caver.klay.contract.once', () => {
  it('when event fires, data should be retrived through contract.once', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver(websocketURL)

    const helloContractABI = [ { "constant": true, "inputs": [], "name": "greetCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "greeting", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_greeting", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "greeting", "type": "string" }, { "indexed": true, "name": "greetCount", "type": "uint256" } ], "name": "greetevent", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "cmd", "type": "string" }, { "indexed": false, "name": "input", "type": "uint256" }, { "indexed": true, "name": "greetCount", "type": "uint256" } ], "name": "countevent", "type": "event" }, { "constant": true, "inputs": [], "name": "getStatus", "outputs": [ { "name": "", "type": "string" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "_greeting", "type": "string" } ], "name": "setGreeting", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getGreeting", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_str", "type": "string" } ], "name": "echo", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [], "name": "greet", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "delta", "type": "uint256" } ], "name": "addCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "count", "type": "uint256" } ], "name": "setCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "resetCount", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]

    const helloContractDeployedAddress = '0x7128c8ec37ff1faaa002b466970a3c6aec3d0eec'

    const contract = new caver.klay.Contract(helloContractABI, helloContractDeployedAddress)
    const topic = caver.utils.sha3('greetevent(string,uint256)')
    // const topic = caver.utils.sha3('countevent(string,uint256,uint256)')

    contract.events.countevent({
      topics: [topic],
    }, (error, data) => {
      console.log(error, 'error')
      console.log(JSON.stringify(data))
      done()
    })

    const { address } = caver.klay.accounts.wallet.add('0xc659a42e4423c6782346b182ccbd895d4a2135df85100a369054ab5d274dfa88')

    const options = {
      from: address,
      gas: '3000000',
    }

    contract.methods.greet().send(options)
  })
}).timeout(100000)
