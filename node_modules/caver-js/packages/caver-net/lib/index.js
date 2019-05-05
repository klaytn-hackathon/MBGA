/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Modified hard-coded new Method({ ... }) array structure by exporting it to caver-rtm(rpc). 2018-07
 * Explicit arguments array as ..args (Applied ES6 feature). 2018-07
 */
var core = rootRequire('caver-core');
var utils = rootRequire('caver-utils');

const rpc = require('../../caver-rtm').rpc;

var Net = function Net(...args) {
  var _this = this;

  core.packageInit(this, args);
  const rpcCalls = [rpc.net.getId, rpc.net.isListening, rpc.net.getPeerCount];
  rpcCalls.forEach(function (method) {
    method.attachToObject(_this);
    method.setRequestManager(_this._requestManager);
  });
};

module.exports = Net;