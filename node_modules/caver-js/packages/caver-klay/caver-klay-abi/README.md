# caver-klay-abi

This is a sub package of [web3.js][repo]

This is the abi package to be used in the `caver-klay` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install caver-klay-abi
```

### In the Browser

Build running the following in the [web3.js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/caver-klay-abi.js` in your html file.
This will expose the `Web3EthAbi` object on the window object.


## Usage

```js
// in node.js
var Web3EthAbi = require('caver-klay-abi');

Web3EthAbi.encodeFunctionSignature('myMethod(uint256,string)');
> '0x24ee0097'
```
