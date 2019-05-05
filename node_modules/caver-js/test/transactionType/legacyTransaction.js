require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('Legacy: Legacy transaction', () => {
  it('Sign transaction', (done) => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const transaction = {
      from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
      to: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
      gas: '0x3b9ac9ff',
      gasPrice: '0x19',
      nonce: '0x0',
      value: '0x174876e800',
      chainId: '0x1',
    }

    caver.klay.accounts.signTransaction(transaction, privateKey)
      .then(({ rawTransaction }) => {
        expect(rawTransaction).to.equal('0xf8668019843b9ac9ff94d03227635c90c7986f0e3a4e551cefbca8c5531685174876e8008025a0399466cac18fe56a0607adea3de14a8d1dca4b3445080361246ec125adb2a1f3a06d187fdceed7e5c9d1b9142cbd368ce615f77bbedebf1df3a05166c8561d71c4')
        done()
      })
      .catch(done)
  }).timeout(200000)
})
