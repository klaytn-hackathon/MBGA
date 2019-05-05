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

const Subscription = require('./subscription.js')

/**
 * Subscriptions constructor
 * Subscriptions instance를 만드는 constructor로, options를 parameter로 받아서
 * name, type, subscriptions를 options에 있는 값으로 초기화해준다.
 * requestManager는 null로 초기화 해준다. (추 후에 setRequestManager를 통해 값 설정됨.)
 */

function Subscriptions(options) {
  this.name = options.name
  this.type = options.type
  this.subscriptions = options.subscriptions || {}
  this.requestManager = null
};

/**
 * setRequestManager
 * requestManager를 Subscriptions instance에 붙여준다.
 */
Subscriptions.prototype.setRequestManager = function (requestManager) {
  this.requestManager = requestManager
};

/**
 * attachToObject
 * buildCall 메서드를 통해 생긴 함수를 parameter로 들어온 object에 attach 해준다.
 */
Subscriptions.prototype.attachToObject = function (obj) {
    var func = this.buildCall()
    /**
     * Subscriptions instantiate 할 때 options에 들어온 name을 보통
     * new CaverSubscriptions({
     *       name: 'subscribe',
     *      type: 'eth',
     *      subscriptions: {
     *          'newBlockHeaders': {
     *              subscriptionName: 'newHeads',
     *              params: 0,
     *              outputFormatter: formatters.outputBlockFormatter
     *          },
     *          'pendingTransactions': {
     *              params: 0,
     *              outputFormatter: formatters.outputTransactionFormatter
     *          }
     *      }
     *  })
       이런 식으로 주는데, name에 'xxx.subscribe' 이런식으로 붙을 때 split 해서
       parameter로 들어온 obj에 붙이는 작업을 해준다.
       그러면 obj.xxx.subscribe 에 값이 들어가게 된다.
       참고) Javascript object는 reference type이라서 object에 바로 property 붙여주면
            실제 그 reference에 붙음.
     */
    var name = this.name.split('.');
    if (name.length > 1) {
        obj[name[0]] = obj[name[0]] || {};
        obj[name[0]][name[1]] = func;
    } else {
        obj[name[0]] = func;
    }
};

/**
 * buildCall
 * subscription instance를 만드는 함수를 리턴해주는 함수이다.
 * 참고) 함수를 리턴해주는 함수는 Javascript 내에서 빈번히 쓰이는 패턴이다.
 * 링크 공유 : https://hackernoon.com/effective-functional-javascript-first-class-and-higher-order-functions-713fde8df50a
 */
Subscriptions.prototype.buildCall = function() {
    var _this = this;

    return function(){
        /**
         * Subscriptions instance 만드는 과정에 subscriptions라는 object를 붙여주는데,
         * 보통
         *            subscriptions: {
         *               'newBlockHeaders': {
         *                   subscriptionName: 'newHeads',
         *                   params: 0,
         *                   outputFormatter: formatters.outputBlockFormatter
         *              },
         *               'pendingTransactions': {
         *                   params: 0,
         *                   outputFormatter: formatters.outputTransactionFormatter
         *              }
         * 이런식으로 붙게 되는데, buildCall() 을 부르면서 argument를 따로 넣어준 경우에,
         * subscriptions property에 해당하는 값이 없다면 console.warn으로 경고만 준다.
         * (에러는 아니어서 어쨌든 subscribe는 함.)
         */
        if(!_this.subscriptions[arguments[0]]) {
            console.warn('Subscription '+ JSON.stringify(arguments[0]) +' doesn\'t exist. Subscribing anyway.');
        }

        /**
         * subscription.js 에 정의되어 있는 Subscription을 instantiate 함.
         * subscription, requestManager, type을 세팅해준다.
         * 여기서 말하는 type은 'eth' 같은 string이다.
         * 참고) buildCall을 부를 때, 따로 인자가 들어왔다면 arguments[0]에 값이 들어있을텐데,
         * 그게 없는 경우에도 Subscription을 instantiate하는데에는 무리가 없어보인다.
         * (위에서도 console.warn을 해주었으니.)
         */
        var subscription = new Subscription({
            subscription: _this.subscriptions[arguments[0]],
            requestManager: _this.requestManager,
            type: _this.type
        });

        /**
         * subscription.js에 정의되어있는 subscribe 함수를 실행하되, buildCall을 부를 때
         * argument로 준 인자들(arguments)을 주어서 실행한다.
         */
        return subscription.subscribe.apply(subscription, arguments);
    };
};


module.exports = {
    subscriptions: Subscriptions,
    subscription: Subscription
};
