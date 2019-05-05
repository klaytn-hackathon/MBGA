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

var _ = require('underscore');

var getNetworkType = function (callback) {
    var _this = this,
        id;

    /**
     * Net instance가 this.net에 붙어있는데, 그 instance에 붙어있는 getId 메서드를 호출한다.
     * 그렇게 해서 가져온 id를 이 instance에 this.id에 붙여주고,
     * 0번째 블락(제네시스블락)을 getBlock 메서드를 통해 가져오고
     * 해당 블락의 hash를 체크해서
     * main, morden, ropsten, rinkeby, kovan 중 어떤 것인지 확인하고
     * 이외의 것일시 'private'이라고 return해준다.
     */
    return this.net.getId()
        .then(function (givenId) {

            id = givenId;

            return _this.getBlock(0);
        })
        .then(function (genesis) {
            var returnValue = 'private';

            if (genesis.hash === '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3' &&
                id === 1) {
                returnValue = 'main';
            }
            if (genesis.hash === '0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303' &&
                id === 2) {
                returnValue = 'morden';
            }
            if (genesis.hash === '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d' &&
                id === 3) {
                returnValue = 'ropsten';
            }
            if (genesis.hash === '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177' &&
                id === 4) {
                returnValue = 'rinkeby';
            }
            if (genesis.hash === '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9' &&
                id === 42) {
                returnValue = 'kovan';
            }

            if (_.isFunction(callback)) {
                callback(null, returnValue);
            }
            /**
             * 여기서 returnValue를 return했다는 것은 getNetworkType의 리턴 값 형식이
             * promise라는 의미이고,
             * 따라서 .then이나 .catch를 통해서 콜백을 받을 수 있다.
             */
            return returnValue;
        })
        .catch(function (err) {
            if (_.isFunction(callback)) {
                callback(err);
            } else {
                throw err;
            }
        });
};

module.exports = getNetworkType;
