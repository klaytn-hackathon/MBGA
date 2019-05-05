var Caver = require('./index.js')
var caver = new Caver('http://aspen.klaytn.com')

const privateKey = '0x8514e9c492fbc2393e6afc978cee15397dc8b2c9678315444b5f7aacbc7c73b0'
const txObject = {
  nonce: '0x3',
  gasPrice: '25000000000',
  gasLimit: '0x27100',
  to: '0x0000000000000000000000000000000000000000',
  value: '0x00',
  data: '0xf7314737432000000000000000000000000000000000000000000000000000000100023',
};

caver.klay.accounts.signTransaction(txObject, privateKey)
  .then(({ rawTransaction }) => {
    caver.klay.sendSignedTransaction(rawTransaction)
      .on('receipt', console.log)
  });
