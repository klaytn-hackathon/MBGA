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
var errors = require('../../caver-core-helpers').errors;
var EventEmitter = require('eventemitter3');


function Subscription(options) {
  /**
   * EventEmitter의 constructor는 아래와 같이 생겼다. (eventemitter3 라이브러리 참조)
   * function EventEmitter() {
   *  this._events = new Events();
   *  this._eventsCount = 0;
   * }
   * EventEmitter.call(this)를 하게 되면, 지금 Subscription 함수의 컨텍스트(this)를 사용해서
   * this._event = new Events();
   * this._eventsCount = 0; 을 수행하는 것이다.
   * 즉 이렇게 하게 되면, var sub = new Subscription(); 으로 Subscription instance를 만들어 주었을 때,
   * sub._event, sub._eventsCount 에 값이 들어가있게 된다.
   * 참조: Object.create() 를 사용한 고전적인 상속방법
   * 링크공유: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/create
   */
    EventEmitter.call(this);

    /**
     * Subscription의 id, callback, arguments, _reconnectIntervalId를 null로 초기화해준다.
     */
    this.id = null;
    this.callback = null;
    this.arguments = null;
    this._reconnectIntervalId = null;

    /**
     * 참고) 보통 Subscriptions는 이런 식으로 instantiate 된다.
     *  new Subscriptions({
     *       name: 'subscribe',
     *       type: 'eth',
     *       subscriptions: {
     *           'newBlockHeaders': {
     *               subscriptionName: 'newHeads', // replace subscription with this name
     *               params: 0,
     *               outputFormatter: formatters.outputBlockFormatter
     *           }
     *      }
     *   })
     */

    this.options = {
        subscription: options.subscription,
        type: options.type,
        requestManager: options.requestManager
    };
}

// INHERIT
/**
 * Subscription의 prototype을 EventEmitter.prototype으로 해주어서, EventEmitter.prototype에 정의된
 * 모든 메서드들을 사용할 수 있게 해준다.
 */
Subscription.prototype = Object.create(EventEmitter.prototype);
/**
 * 위에 Subscription.prototype을 모두 EventEmitter.prototype으로 해주면,
 * constructor마저 Subscription의 constructor가 아닌, EventEmitter의 constructor로 설정되기 때문에,
 * constructor는 Subscription으로 해준다.
 */
Subscription.prototype.constructor = Subscription;


/**
 * Should be used to extract callback from array of arguments. Modifies input param
 *
 * @method extractCallback
 * @param {Array} arguments
 * @return {Function|Null} callback, if exists
 */

/**
 * _extractCallback
 * parameter로 받은 args의 마지막 인자로 주로 callback이 오게끔 함수 사용이 되는 듯 한데,
 * 이 때, 마지막 인자에 있는 callback 함수만 빼내기 위한 함수이다.
 * underscore의 isFunction 함수를 통해 마지막 인자가 'function' 타입인지 체크하고,
 * 맞다면 pop을 통해 마지막 인자(콜백)을 빼낸다.
 * 참고) _.isFunction(arg)는 typeof(arg) == 'function' 과 똑같다. (underscore 굳이 안써도 되는 부분.)
 */
Subscription.prototype._extractCallback = function (args) {
    if (_.isFunction(args[args.length - 1])) {
        return args.pop(); // modify the args array!
    }
};

/**
 * Should be called to check if the number of arguments is correct
 *
 * @method validateArgs
 * @param {Array} arguments
 * @throws {Error} if it is not
 */

/**
 * _validateArgs
 * parameter로 받은 args들의 validation(arguments의 숫자가 subscription의 params와 동일한지)
 * 체크를 하는 함수이다.
 * 추가적으로, this.options에 subscription이 정의되어있지 않다면
 * subscription은 {} 빈 object로, subscription.params는 0 으로 값을 초기화 해준다.
 */
Subscription.prototype._validateArgs = function (args) {
    var subscription = this.options.subscription;

    if(!subscription)
        subscription = {};

    if(!subscription.params)
        subscription.params = 0;

    if (args.length !== subscription.params) {
        throw errors.InvalidNumberOfParams(args.length, subscription.params + 1, args[0]);
    }
};

/**
 * Should be called to format input args of method
 *
 * @method formatInput
 * @param {Array}
 * @return {Array}
 */

/**
 * _formatInput
 * inputFormatter라는 게 subscription에 정의되어 있으면,(array 형태로 정의되어 있음.)
 * inputFormatter의 각 아이템들을 돌면서 parameter로 들어온 args를 format해준다.
 * 만약 inputFormatter가 없거나 subscription이 정의되어 있지 않다면, formatInput을 해도
 * formatter가 없기 때문에, 그냥 들어온 args 그대로 return 해준다.
 */
Subscription.prototype._formatInput = function (args) {
    var subscription = this.options.subscription;

    /**
     * subscription이 정의되어 있지 않다면 그냥 들어온 args 그대로 다시 리턴
     */
    if (!subscription) {
        return args;
    }

    /**
     * inputFormatter가 없다면 그냥 들어온 args 그대로 다시 리턴
     */
    if (!subscription.inputFormatter) {
        return args;
    }

    /**
     * inputFormatter(array) 이 정의되어 있으면, 각 배열들에 정의된 formatter를
     * args(array)에 순서대로 format을 해준다.
     */
    var formattedArgs = subscription.inputFormatter.map(function (formatter, index) {
        return formatter ? formatter(args[index]) : args[index];
    });

    /**
     * 각 args에 있는 아이템들의 format이 끝나면 그렇게 format된 args를 리턴해준다. (formattedArgs)
     */
    return formattedArgs;
};

/**
 * Should be called to format output(result) of method
 *
 * @method formatOutput
 * @param {Object}
 * @return {Object}
 */

/**
 * _formatOutput
 * i) parameter에 result로 들어온 값이 truthy한 값이고,
 * ii) subscription에 outputFormatter가 정의되어 있다면,
 * outputFormatter를 이용해서 result를 format해준다.
 */
Subscription.prototype._formatOutput = function (result) {
    var subscription = this.options.subscription;

    return (subscription && subscription.outputFormatter && result) ? subscription.outputFormatter(result) : result;
};

/**
 * Should create payload from given input args
 *
 * @method toPayload
 * @param {Array} args
 * @return {Object}
 */

/**
 * _toPayload
 *
 */
Subscription.prototype._toPayload = function (args) {
    /**
     * params를 빈 배열로 초기화, 이 params는 지금은 빈 배열이지만, 함수의 끝자락에서
     * 다음과 같은 형태를 갖게 된다.
     * [this.subscriptionMethod, ...this.arguments]
     */
    var params = [];
    /**
     * _extractCallback 메서드를 통해 args의 마지막 index에 있는 callback 함수를 빼낸다.
     * 이 결과로 인해 args 배열에서 마지막 아이템(콜백함수) 하나가 빠지게 된다.
     */
    this.callback = this._extractCallback(args);

    /**
     * this.subscriptionMethod가 정의되어 있지 않다면, args의 맨 첫 번 째 인자를 빼서,
     * this.subscriptionMethod에 박아준다.
     */
    if (!this.subscriptionMethod) {
        this.subscriptionMethod = args.shift();

        // replace subscription with given name
        /**
         * Subscription instance를 초기화 할 때 준 options에
         * subscription.subscriptionName이 지정되어 있었다면,
         * this.subscriptionMethod에 그 값을 넣어준다.
         * subscriptionName은 다음 중 하나이다.
         * 'pendingTransactions', 'newBlockHeaders', 'syncing', 'logs'
         */
        if (this.options.subscription.subscriptionName) {
            this.subscriptionMethod = this.options.subscription.subscriptionName;
        }
    }

    /**
     * Subscription instance에 this.arguments가 정의되어 있지 않다면 (null 이라면)
     * 1) _toPayload의 parameter로 들어온 args를 formatInput을 통해 format 해주어서 this.arguments에 넣어주고,
     * 2) 그렇게 넣어준 값의 validation 체크를 한다.
     * 3) 이 과정이 끝나고, params에 들어가 있었던 args를 빈 배열로 만들어준다.
     * 즉, args가 빈 배열이 되었다는 의미는 1)과 2) 과정을 차질없이 진행했다는 의미로,
     * this.arguments엔 format된 args로 값이 채워졌을 것이고,
     * _validateArgs를 통해 subscription.params와 this.arguments의 갯수가 동일한지 체크가 되었다는 의미이다.
     */
    if (!this.arguments) {
        this.arguments = this._formatInput(args);
        this._validateArgs(this.arguments);
        args = []; // make empty after validation

    }

    // re-add subscriptionName
    /**
     * 빈 배열이 었던 'params'에 this.subscriptionMethod를 넣어준다.
     * params == [this.subscriptionMethod]
     */
    params.push(this.subscriptionMethod);
    /**
     * 'params'에 this.arguments(format된 args) 배열을 concat으로 붙여준다.
     * params == [this.subscriptionMethod, ...this.arguments]
     * 참고) ...this.arguments는 ES6의 spread operator이다. 배열에 있는 아이템들을 펴서
     * 다시 배열에 넣어주는 operator이다.
     * 링크 공유: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Spread_operator
     */
    params = params.concat(this.arguments);

    /**
     * this.arguments에 이미 값이 있는 상황에서 args가 빈 배열이 아닌 경우, 이 조건문에 들어가게 된다.
     * this.arguments에 이미 값이 있다는 것은 이미 subscription을 한번 instantiate 했다는 의미이고,
     * _toPayload 함수를 (Subscription.prototype.subscribe을 통해서) 실행할 때 _extractCallback을 통해 args에 있는 마지막 인자(콜백함수)를 하나 빼 간다.
     * 요약하자면,
     * i) 이미 subscription이 instantiate 되었고,
     * ii) 다시금 toPayload 함수를 부를 때에 parameter로 들어온 args에 callback 함수 외에 인자를 하나 더 주었을 때
     * 이 조건문에 들어가게 되어 throw를 뱉는다.
     */
    if (args.length) {
        throw new Error('Only a callback is allowed as parameter on an already instantiated subscription.');
    }

    /**
     * this.options.type 으로 들어온 것에 '_subscribe' string을 붙여서 method값을 주고,
     * params는 params 그대로 준다.
     */
    return {
        method: this.options.type + '_subscribe',
        params: params
    };
};

/**
 * Unsubscribes and clears callbacks
 *
 * @method unsubscribe
 * @return {Object}
 */
/**
 * unsubscribe
 * 1) requestManager에 붙어있는 removeSubscription을 통해 subscription을 지우고,
 * rpc로 unsubscribe한다는 것을 requestManager의 removeSubscription을 통해 날린다.
 * 2) subscription id로서 붙어있던 this.id를 null로 초기화 하고
 * 3) eventemitter3을 통해 상속받은 removeAllListeners 메서드를 사용해
 * 이 instance에 붙어있는 eventListener를 모두 날려준다.
 * 4) Subscription.prototype.subscribe를 통해 setInterval 설정이 된 것을
 * clearInterval을 통해서 날려준다.
 */
Subscription.prototype.unsubscribe = function(callback) {
    this.options.requestManager.removeSubscription(this.id, callback);
    this.id = null;
    this.removeAllListeners();
    clearInterval(this._reconnectIntervalId);
};

/**
 * Subscribes and watches for changes
 *
 * @method subscribe
 * @param {String} subscription the subscription
 * @param {Object} options the options object with address topics and fromBlock
 * @return {Object}
 */
Subscription.prototype.subscribe = function() {
    var _this = this;
    /**
     * arguments는 현재 subscribe 함수에 parameter를 아무것도 안 받게끔 되어있는데,
     * subscribe(arg1, arg2, arg3, arg4) 이런 식으로 호출하게 되면
     * 그런 arg1, arg2, arg3, arg4 들을 모두 arguments에서 받게 된다.
     * 즉, parameter를 따로 설정해두지 않은 경우에 parameter를 넣어서 호출했을 때 인자들을 받는
     * 방법이다. 이 arguments는 '배열'은 아니고 '유사배열'이라는 형태이기 때문에 배열로써 완전히
     * 기능을 하진 못한다. 그렇기 때문에 Array.prototype.slice.call(arguments) 라는 메서드를
     * 이용해서 '완전한 배열'로 만들어준다. args는 이제 '완전한 배열' 로 볼 수 있다.
     */
    var args = Array.prototype.slice.call(arguments);
    /**
     * args를 payload화 한다.
     * 이를 통해 payload는
     * {
     *  method: ...,
     *  params: ...,
     * }
     * 형태로 변하게 될 것이다.
     */
    var payload = this._toPayload(args);

    /**
     * payload가 없을 경우 그냥 Subscription instance를 리턴한다.
     */
    if(!payload) {
        return this;
    }

    /**
     * requestManager의 provider가 설정되어 있지 않을 경우 에러를 뱉는다.
     * emit은 eventemitter3의 prototype method이다.
     */
    if(!this.options.requestManager.provider) {
        var err1 = new Error('No provider set.');
        this.callback(err1, null, this);
        this.emit('error', err1);
        return this;
    }

    // throw error, if provider doesnt support subscriptions
    /**
     * requestManager의 provider에 on이 없는 경우 (subscription을 지원하지 않는 경우)
     * 에러를 뱉는다.
     * emit은 eventemitter3의 prototype method이다.
     */
    if(!this.options.requestManager.provider.on) {
        var err2 = new Error('The current provider doesn\'t support subscriptions: '+ this.options.requestManager.provider.constructor.name);
        this.callback(err2, null, this);
        this.emit('error', err2);
        return this;
    }

    // if id is there unsubscribe first
    /**
     * 이미 Subscription instance에 id가 셋 되어있는 경우, 일단 unsubscribe한다.
     */
    if (this.id) {
        this.unsubscribe();
    }

    // store the params in the options object
    /**
     * payload.params에 들어있는 것은 다음과 같다.
     * [type, options, callback]
     * type은 'pendingTransactions', 'newBlockHeaders', 'syncing', 'logs'와 같은 string을 의미하고,
     * options는
     * {
     *   address: '0x123456..',
     *   topics: ['0x12345...']
     * } 와 같은 형태의 object이다.
     * 마지막으로 callback은 말 그대로 subscribe 한 후에 실행되는 callback이다.
     * 위 type, options, callback은 각각 payload.params[0], payload.params[1], payload.params[2]로 참조 가능하다.
     */
    this.options.params = payload.params[1];

    // get past logs, if fromBlock is available
    if (payload.params[0] === 'logs'
      && _.isObject(payload.params[1])
      && payload.params[1].hasOwnProperty('fromBlock')
      && isFinite(payload.params[1].fromBlock)
    ) {
        // send the subscription request
        this.options.requestManager.send({
            method: 'klay_getLogs',
            params: [payload.params[1]]
        }, function (err, logs) {
            if(!err) {
                logs.forEach(function(log){
                    var output = _this._formatOutput(log);
                    _this.callback(null, output, _this);
                    _this.emit('data', output);
                });

                // TODO subscribe here? after the past logs?

            } else {
                _this.callback(err, null, _this);
                _this.emit('error', err);
            }
        });
    }

    // create subscription
    // TODO move to separate function? so that past logs can go first?

    /**
     * ?TODO: payload.params[0]이 'logs'가 아닌 경우에는 fromBlock이라는 option이 필요없기 때문에
     * delete로 삭제하는 듯이 보인다.
     */
    if (typeof payload.params[1] === 'object')
        delete payload.params[1].fromBlock;
    /**
     * requestManager의 send 메서드를 이용해서 위에서 만들어준 payload를 보내고,
     * 그에 대한 콜백을 실행.
     * 이 콜백 내에서 크게 세 가지 케이스가 생긴다.
     * case 1) 성공상황
     * case 2) 실패상황 - 콜백이 있는 경우
     * case 3) 실패상황 - 콜백이 없는 경우
     */
    this.options.requestManager.send(payload, function (err, result) {
      /**
       * payload를 requestManager.send 통해 보낸 후 콜백
       * case 1) 성공상황 - 에러가 없고 result가 있는 상황 (여기서 result는 subscription id로 쓰인다.)
       * - _this.id(subscription id)를 result 값으로 넣어준다.
       * - addSubscription에 subscription id, subscription type, type(ex: eth)을
       * - 넣어주고, 그에 대한 콜백을 수행한다.
       */
        if (!err && result) {
            _this.id = result;

            // call callback on notifications
            _this.options.requestManager.addSubscription(_this.id, payload.params[0], _this.options.type, function(err, result) {

                /**
                 * case 1-1) 성공상황 - addSubscription에 대한 콜백을 수행하는데 에러가 없는 상황
                 * 1) result 값을 array화 시켜주고,
                 * 2) array화 된 result를 돌면서 각 아이템을 _this._formatOutput을 사용해 format해준다.
                 * 3) subscriptionHandler라는게 따로 설정되어 있으면, handler를 콜하고,
                 *    없다면, eventemitter의 _this.emit을 통해서 포맷 된 output을 emit해준다.
                 * 4) (optional) _this.callback이 설정되어 있따면, 콜백을 부른다.
                 */
                if (!err) {
                    if (!_.isArray(result)) {
                        result = [result];
                    }

                    result.forEach(function(resultItem) {
                        var output = _this._formatOutput(resultItem);

                        if (_.isFunction(_this.options.subscription.subscriptionHandler)) {
                            return _this.options.subscription.subscriptionHandler.call(_this, output);
                        } else {
                            _this.emit('data', output);
                        }

                        // call the callback, last so that unsubscribe there won't affect the emit above
                        if (_.isFunction(_this.callback)) {
                            _this.callback(null, output, _this);
                        }
                    });
                } else {
                    /**
                     * case 1-2) 실패상황 - addSubscription에 대한 콜백을 수행하는데 에러가 있는 상황
                     * 1) requestManager의 removeSubscription을 통해 subscription을 없애준다.
                     * 2) connection fail이 일어나면 setInterval을 통해 500ms 당 반복적으로
                     *    provider.reconnect()를 시도한다. reconnect에 성공해서, provider.once('connect')
                     *    의 콜백이 실행되면 거기서 clearInterval로 500ms 당 반복적으로 reconnect 시도하는 것을 없앤다.
                     * 3) 2)는 interval로 일어나다가 해결되는거고, 어쨌든 이 else 문에 들어왔다는 것은 error가 발생했다는 것이니까,
                     *    emit으로 error라는 것을 알려준다.
                     * 4) (optional) callback이 지정되어 있었다면 그 콜백을 수행해준다.
                     */
                    // unsubscribe, but keep listeners
                    _this.options.requestManager.removeSubscription(_this.id);

                    // re-subscribe, if connection fails
                    if(_this.options.requestManager.provider.once) {
                        _this._reconnectIntervalId = setInterval(function () {
                            // TODO check if that makes sense!
                            if (_this.options.requestManager.provider.reconnect) {
                                _this.options.requestManager.provider.reconnect();
                            }
                        }, 500);

                        _this.options.requestManager.provider.once('connect', function () {
                            clearInterval(_this._reconnectIntervalId);
                            _this.subscribe(_this.callback);
                        });
                    }
                    _this.emit('error', err);

                     // call the callback, last so that unsubscribe there won't affect the emit above
                     if (_.isFunction(_this.callback)) {
                        _this.callback(err, null, _this);
                    }
                }
            });
        } else if (_.isFunction(_this.callback)) {
          /**
           * case 2) 실패상황 - 콜백을 수행하는데 에러가 있고, _this.callback이 설정되어 있는 상황
           * - 콜백을 수행하고 error를 emit해준다.
           */
            _this.callback(err, null, _this);
            _this.emit('error', err);
        } else {
            /**
             * case 3) 실패상황 - 콜백을 수행하는데 에러가 있고, _this.callback이 설정되어 있지 않는 상황
             * - 바로 error를 emit해준다.
             */
            // emit the event even if no callback was provided
            _this.emit('error', err);
        }
    });

    /**
     * 추 후에 이 subscription instance에 대해서 cancel하기 위해서는 이 instance에 대한
     * 참조가 필요하기 때문에 return this를 해준다.
     */
    // return an object to cancel the subscription
    return this;
};

module.exports = Subscription;
