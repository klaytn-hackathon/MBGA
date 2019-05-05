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
 */

var core = require('../../../caver-core');
var Method = require('../../../caver-core-method');
var utils = require('../../../caver-utils');
var Net = require('../../../caver-net');

var formatters = require('../../../caver-core-helpers').formatters;
const rpc = require('../../../caver-rtm').rpc

var Personal = function Personal(...args) {
    var _this = this;

    // sets _requestmanager
    /**
     * 대부분의 web3 패키지들과 유사하게 requestManager를 붙여준다.
     */
    core.packageInit(this, args);

    this.net = new Net(this.currentProvider);

    /**
     * defaultAccount와 defaultBlock을 각각 null과 'latest'로 초기화 해준다.
     * 여기서 정의된 것들은 Object.defineProperty... 에 의해서 다음과 같이 접근할 수 있다.
     * cav.klay.personal.defaultAccount
     * cav.klay.personal.defaultBlock
     */
    var defaultAccount = null;
    var defaultBlock = 'latest';

    /**
     * Object.defineProperty는 말 그대로 object에 property를 붙여주는데,
     * this.defaultAccount 로 '값에 접근할 때' -> get 함수를 콜하고
     * this.defaultAccount = '???' 와 같이 '값을 쓸 때' -> set 함수를 콜하는 식이다.
     * 값을 쓸 때 '쓴 값' (위의 예에서 '???')은 set 함수의 첫 번째 parameter에 담기게 된다.
     */
    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
              /**
               * util을 통해 checksumaddress로 변환.
               * !/^(0x)?[0-9a-f]{40}$/i.test(address) 정규식 처리를 통해 올바른 주소인지도 확인한다.
               * "0x로 시작하면서 && 0-9a-f로 이루어진 문자 40자리로 구성되어 있을 것."
               */
              defaultAccount = utils.toChecksumAddress(formatters.inputAddressFormatter(val));
            }

            // update defaultBlock
            /**
             * 이 패키지에서 정의된 모든 method를 돌면서 defaultAccount를 붙여준다.
             */
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount;
            });

            return val;
        },
        enumerable: true
    });
    Object.defineProperty(this, 'defaultBlock', {
        get: function () {
            return defaultBlock;
        },
        set: function (val) {
          if (!utils.isValidBlockNumberCandidate(val)) {
            throw(new Error('Invalid default block number.'))
            return
          }
          defaultBlock = val;

          // update defaultBlock
          /**
           * 이 패키지에서 정의된 모든 method를 돌면서 defaultBlock을 붙여준다.
           */
          methods.forEach(function(method) {
              method.defaultBlock = defaultBlock;
          });

          return val;
        },
        enumerable: true
    });


    /**
     * jsonRPC로 보낼 메서드들에 대해서 정의하고 있다.
     * getAccounts, newAccount, unlockAccount, lockAccount,
     * importRawKey, sendTransaction, signTransaction, sign,
     * ecRecover 에 대해서 정의되어 있으며, 각각에 대한 json rpc call시의 method는
     * 'call' 이라는 property에 정의해놓는다. ex) getAccounts -> 'personal_listAccounts'
     */
    var methods = [
      rpc.personal.newAccount,
      rpc.personal.unlockAccount,
      rpc.personal.lockAccount,
      rpc.personal.importRawKey,
      rpc.personal.sendTransaction,
      rpc.personal.signTransaction,
      rpc.personal.sign,
      rpc.personal.ecRecover,
    ];
    /**
     * 정의한 methods들을 이 객체에 attach 해주고, 각 method에 request manager를 달아준다.
     * 추가적으로 defaultBlock, defaultAccount도 달아준다.
     */
    methods.forEach(function(method) {
        method.attachToObject(_this);
        method.setRequestManager(_this._requestManager);
        method.defaultBlock = _this.defaultBlock;
        method.defaultAccount = _this.defaultAccount;
    });
};

module.exports = Personal;
