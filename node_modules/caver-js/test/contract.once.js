const { expect } = require('./extendedChai')

const websocketURL = require('./testWebsocket')

describe('caver.klay.contract.once', () => {
  it('when event fires, data should be retrived through contract.once', (done) => {
    var Caver = require('../index.js')
    const caver = new Caver(websocketURL)

    const helloContractABI = [ { "constant": true, "inputs": [], "name": "greeting", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_greeting", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "method", "type": "string" }, { "indexed": false, "name": "parameter", "type": "string" } ], "name": "callevent", "type": "event" }, { "constant": false, "inputs": [ { "name": "_greeting", "type": "string" } ], "name": "setGreeting", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "say", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_str", "type": "string" } ], "name": "echo", "outputs": [ { "name": "", "type": "string" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" } ]

    const helloContractDeployedAddress = '0xb01898b4614ce5031c0e4898627f77b3fe339fc7'

    const contract = new caver.klay.Contract(helloContractABI, '0xb01898b4614ce5031c0e4898627f77b3fe339fc7')

    contract.once('callevent', (error, data) => {
      expect(data).not.to.be.a('null')
      done()
    })

    const { address } = caver.klay.accounts.wallet.add('0xc659a42e4423c6782346b182ccbd895d4a2135df85100a369054ab5d274dfa88')

    const options = {
      from: address,
      gas: '30000',
    }

    contract.methods.say().send(options)
  })
}).timeout(10000)
