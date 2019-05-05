const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

describe('wallet instance default wallet name', (done) => {
  it('should return valid default wallet name', async () => {
    const Caver = require('../index.js')
    const caver = new Caver(testRPCURL)
    const privateKey = '0x24649b229c4aa832b66d8ce419f29336785586374fd21975ebcf1126198b1016';

    const txObject = {
      gasPrice: '25000000000',
      gasLimit: '30000',
      to: '0x0000000000000000000000000000000000000000',
      data: '0xfaaddd',
      value: caver.utils.toPeb(1, 'KLAY'),
    };

    caver.klay.accounts.signTransaction(txObject, privateKey)
      .then(({ rawTransaction }) => {
        caver.klay.sendSignedTransaction(rawTransaction)
          .on('receipt', console.log)
      });
  })
})
