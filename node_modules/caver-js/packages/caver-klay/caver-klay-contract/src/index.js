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
var core = require('../../../caver-core');
var Method = require('../../../caver-core-method');
var utils = require('../../../caver-utils');
var Subscription = require('../../../caver-core-subscriptions').subscription;
var formatters = require('../../../caver-core-helpers').formatters;
var errors = require('../../../caver-core-helpers').errors;
var abi = require('../../caver-klay-abi');


/**
 * Should be called to create new contract instance
 *
 * @method Contract
 * @constructor
 * @param {Array} jsonInterface
 * @param {String} address
 * @param {Object} options
 */

/**
 * 사용 예)
 * var myContract = new cav.klay.Contract([...], '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
 *   from: '0x1234567890123456789012345678901234567891', // default from address
 *   gasPrice: '20000000000', // default gas price in wei, 20 gwei in this case
 *   data: '',(bytecode, 디플로이할 때.)
 *   gas: 200000, (가스 리밋)
 * });
 */
var Contract = function Contract(jsonInterface, address, options) {
    var _this = this,
        args = Array.prototype.slice.call(arguments);

    if(!(this instanceof Contract)) {
        throw new Error('Please use the "new" keyword to instantiate a cav.klay.contract() object!');
    }

    // sets _requestmanager
    core.packageInit(this, [this.constructor.currentProvider]);

    this.clearSubscriptions = this._requestManager.clearSubscriptions;



    if(!jsonInterface || !(Array.isArray(jsonInterface))) {
        throw new Error('You must provide the json interface of the contract when instantiating a contract object.');
    }



    // create the options object
    this.options = {};

    // For Object.defineProperty setter / getter
    let _from, _gasPrice, _gas, _data

    var lastArg = args[args.length - 1];
    if(_.isObject(lastArg) && !_.isArray(lastArg)) {
        options = lastArg;

        /**
         * _getOrSetDefaultOptions은 contract instance 만들 때
         * 마지막 인자로 넘어오는 options를 어느정도 포맷팅 해주는 기능을 한다.
         * 그렇게 포맷팅 해주고 this.options에 _.extend 를 통해 박아줌.
         */
        this.options = _.extend(this.options, this._getOrSetDefaultOptions(options));
        /**
         * address로 들어오는 argument가 String type이 아닌 Object type으로 들어왔을 때,
         * address를 null로 해준다. (parameter reassign하는 전형적인 anti pattern이네.;)
         */
        if(_.isObject(address)) {
            address = null;
        }
    }

    // set address
    Object.defineProperty(this.options, 'address', {
        set: function(value){
            if(value) {
                _this._address = utils.toChecksumAddress(formatters.inputAddressFormatter(value));
            }
        },
        get: function(){
            return _this._address;
        },
        enumerable: true
    });

    /**
     * 보통 ABI가 [] json 어레이 형태로 각 function들 혹은 event들이 정의되어 있다.
     * 예)
     * [
        { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" },
        { "payable": true, "stateMutability": "payable", "type": "fallback" },
        { "anonymous": false, "inputs": [ { "indexed": false, "name": "genes", "type": "uint256" }, { "indexed": false, "name": "owner", "type": "address" }, { "indexed": false, "name": "id", "type": "uint256" } ], "name": "GaveStartKitty", "type": "event" },
        { "constant": true, "inputs": [], "name": "getIsGivenStartingKitty", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" },
        { "constant": false, "inputs": [ { "name": "_type", "type": "uint8" }, { "name": "name", "type": "bytes32" } ], "name": "getStartingKitty", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }
      ]
     * 이 array에 있는 아이템들을 모두 돌면서 얘가 type이 function으로 되어있으면 abi 모듈의 enocdeFunctionSignature를,
     * type이 event로 되어있으면 abi 모듈의 encodeEventSignature를 수행한다.
     */
    // add method and event signatures, when the jsonInterface gets set
    Object.defineProperty(this.options, 'jsonInterface', {
        set: function(value){
            _this.methods = {};
            _this.events = {};

            _this._jsonInterface = value.map(function(method) {
                var func,
                    funcName;

                /**
                 * method.name이 없는 경우는,
                 * i) fallback 함수인 경우
                 * ii) constructor 함수인 경우
                 * 뿐이고 나머지 함수들에는 모두 method.name이 있다.
                 * method.name이 있는 경우는, 아이템에서 inputs까지 가져와서 조합해서
                 * utils의 _jsonInterfaceMethodToString 메서드를 통해
                 * inputs와 name을 조합한 string으로 만들어준다.
                 * 예)
                 * SomeMethod(uint256, string, bool)
                 */
                if (method.name) {
                    funcName = utils._jsonInterfaceMethodToString(method);
                }


                // function
                if (method.type === 'function') {
                    /**
                     * function signature란, 앞의 funcName을 통해
                     * keccak256을 돌리고 남은 4byte(8자리)만 slice하는 것을 의미한다.
                     * cf) 정확히는 '0x' 문자열까지 포함해서 10자리
                     */
                    method.signature = abi.encodeFunctionSignature(funcName);
                    func = _this._createTxObject.bind({
                        method: method,
                        parent: _this
                    });


                    // add method only if not one already exists
                    /**
                     * method.name이 중복되지 않을 경우 바로 _this.methods[method.name]에
                     * 위에서 _createTxObject를 통해 만든 func를 달아준다.
                     */
                    if(!_this.methods[method.name]) {
                        _this.methods[method.name] = func;
                    } else {
                      /**
                       * 중복된 method.name이 존재할 경우,
                       * cascadeFunc라는 것을 달아주는데,
                       * cascadeFunc는, 기존에 존재하던 method를
                       * nextMethod에 달아준 것을 의미한다.
                       * 즉, 'nextMethod'의 유무가 cascadeFunc와 일반 func를 구분짓는
                       * 기준이다.
                       */
                        var cascadeFunc = _this._createTxObject.bind({
                            method: method,
                            parent: _this,
                            nextMethod: _this.methods[method.name]
                        });
                        _this.methods[method.name] = cascadeFunc;
                    }

                    /**
                     * method를 이름(method.name) 외에도 signature 기준으로 달아준다.
                     */
                    // definitely add the method based on its signature
                    _this.methods[method.signature] = func;

                    // add method by name
                    /**
                     * funcName, 즉, 이름으로도 달아준다.
                     * 예) SomeMethod(uint256, string, bool)
                     */
                    _this.methods[funcName] = func;

                    /**
                     * 이를 통해
                     * i) method.signature를 기준으로도 달리고
                     * ii) method.name을 기준으로도 달리고
                     * iii) funcName을 기준으로도 달리게 된다.
                     * 동일한 func라는 함수가.
                     */

                // event
                } else if (method.type === 'event') {
                    /**
                     * abi 모듈을 통해 eventSignature를 만들어주고, method.signature에 달아준다.
                     */
                    method.signature = abi.encodeEventSignature(funcName);
                    /**
                     * ??
                     * 이벤트 binding을 해준다.
                     */
                    var event = _this._on.bind(_this, method.signature);

                    // add method only if not already exists
                    /**
                     * i) 중복된 method.name이 없을 때,
                     * ii) _this.events[method.name].name라는 값이 'bound '일 때,
                     * _this.events[method.name]에 해당 event를 달아준다.
                     */
                    if(!_this.events[method.name] || _this.events[method.name].name === 'bound ')
                        _this.events[method.name] = event;

                    // definitely add the method based on its signature
                    /**
                     * method를 signature 기준으로 달아준다.
                     */
                    _this.events[method.signature] = event;

                    // add event by name
                    /**
                     * method를 funcName을 기준으로도 달아준다.
                     */
                    _this.events[funcName] = event;
                }


                return method;
            });

            // add allEvents
            /**
             * 기본적으로 allEvents라는 것을 contractInstance에 붙여준다.
             */
            _this.events.allEvents = _this._on.bind(_this, 'allevents');

            return _this._jsonInterface;
        },
        get: function(){
            return _this._jsonInterface;
        },
        enumerable: true
    });

    // get default account from the Class
    var defaultAccount = this.constructor.defaultAccount;
    var defaultBlock = this.constructor.defaultBlock || 'latest';

    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
                defaultAccount = utils.toChecksumAddress(formatters.inputAddressFormatter(val));
            }

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
          defaultBlock = val

          return val
        },
        enumerable: true
    });

    // Check for setting options property.
    Object.defineProperty(this.options, 'from', {
        set: function (value) {
          if (value) {
            _this._from = utils.toChecksumAddress(formatters.inputAddressFormatter(value))
          }
        },
        get: function () {
          return _this._from
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'gasPrice', {
        set: function (value) {
          if (value) {
            if (!utils.isValidNSHSN(value))
              throw errors.invalidGasPrice()
            _this._gasPrice = value
          }
        },
        get: function () {
          return _this._gasPrice
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'gas', {
        set: function (value) {
          if (value) {
            if (!utils.isValidNSHSN(value)) throw errors.invalidGasLimit()
            _this._gas = value
          }
        },
        get: function () {
          return _this._gas
        },
        enumerable: true,
    })

    Object.defineProperty(this.options, 'data', {
        set: function (value) {
          if (value) {
            if (!utils.isHexStrict(value)) throw errors.invalidData()
            _this._data = value
          }
        },
        get: function () {
          return _this._data
        },
        enumerable: true,
    })

    // properties
    this.methods = {};
    this.events = {};

    this._address = null;
    this._jsonInterface = [];

    // set getter/setter properties
    this.options.address = address;
    this.options.jsonInterface = jsonInterface;

};

/**
 * provider를 설정해주고, accounts를 _klayAccounts에 달아준다.
 */
Contract.setProvider = function(provider, accounts) {
    // Contract.currentProvider = provider;
    core.packageInit(this, [provider]);

    this._klayAccounts = accounts;
};

Contract.prototype.addAccounts = function (accounts) {
  this._klayAccounts = accounts
}

/**
 * Get the callback and modiufy the array if necessary
 *
 * @method _getCallback
 * @param {Array} args
 * @return {Function} the callback
 */
/**
 * 받은 인자들 중 가장 마지막 값이 'function' type이면 콜백 함수이기 때문에,
 * 그거를 pop해서 가져온다.
 */
Contract.prototype._getCallback = function getCallback(args) {
    if (args && _.isFunction(args[args.length - 1])) {
        return args.pop(); // modify the args array!
    }
};

/**
 * Checks that no listener with name "newListener" or "removeListener" is added.
 *
 * @method _checkListener
 * @param {String} type
 * @param {String} event
 * @return {Object} the contract instance
 */
/**
 * 사용 예)
 * this._checkListener('newListener', subOptions.event.name, subOptions.callback);
 * this._checkListener('removeListener', subOptions.event.name, subOptions.callback);
 * 사용처가 딱 위에 저것밖에 없는데, "newListener"와 "removeListener"라는 이벤트 이름은
 * reserved name처럼 쓰고 있기 때문에, newListener나 removeListener라는 이벤트 이름과
 * 겹치면 에러를 뱉는 기능을 함수이다.
 */
Contract.prototype._checkListener = function(type, event){
    if(event === type) {
        throw new Error('The event "'+ type +'" is a reserved event name, you can\'t use it.');
    }
};


/**
 * Use default values, if options are not available
 *
 * @method _getOrSetDefaultOptions
 * @param {Object} options the options gived by the user
 * @return {Object} the options with gaps filled by defaults
 */
/**
 * _getOrSetDefaultOptions
 * 현재 contract instance에 설정된 options들을
 * i) 그대로 가져오거나
 * ii) parameter로 넘긴 options로 대체해주는
 * 작업을 해주는 함수이다.
 *
 * gasPrice나 from은 특별히 var를 이용해서 작업해주는 라인이 초반에 있는데,
 * 이는 gasPrice나 from은 추가적인 포맷이 필요해서 그렇게 하는 것이다.
 *
 * || 을 통해서 정말로 값이 있는 것만 options에 새로 설정해주기 때문에,
 * options에 아무 parameter를 주지 않으면,
 * 위에서 말한 i)의 기능, "그대로 가져오는" 기능을 수행한다.
 *
 * options에 들어오는 값의 형태는 다음과 같다.
 * {
 *   from: ...,
 *   data: ...,
 *   gasPrice: ...,
 *   gas: ...,
 * }
 *
 * cf)
 * 사실, 이 함수에는 this.options에 직접 값을 박아주는 라인이 없어서,
 * 이 함수를 호출하는것만으로 this.options가 바뀌지 않기 때문에,
 * this.options = _.extend(this.options, this._getOrSetDefaultOptions(options));
 * 이런 형태로 _.extend를 통해 기존 this.options에 달아주는 형태로 사용해야 진짜 this.options가 바뀐다
 * 즉, 단순 이 함수만 호출한다고 해서 this.options에 값이 바뀌는 것은 아니다.
 */
Contract.prototype._getOrSetDefaultOptions = function getOrSetDefaultOptions(options) {
    var gasPrice = options.gasPrice ? String(options.gasPrice): null;
    var from = options.from ? utils.toChecksumAddress(formatters.inputAddressFormatter(options.from)) : null;

    options.data = options.data || this.options.data;

    options.from = from || this.options.from;
    options.gasPrice = gasPrice || this.options.gasPrice;

    // If options.gas isn't set manually, use options.gasLimit, this.options.gas instead.
    if (typeof options.gas === 'undefined') {
      options.gas = options.gasLimit || this.options.gas
    }

    // TODO replace with only gasLimit?
    delete options.gasLimit;

    return options;
};


/**
 * Should be used to encode indexed params and options to one final object
 *
 * @method _encodeEventABI
 * @param {Object} event
 * @param {Object} options
 * @return {Object} everything combined together and encoded
 */

/**
 * _encodeEventABI
 * 1. options에 들어오는 값의 형태는 다음과 같다.
 * options = {
 *   filter: {...},
 *   topics: [...],
 * }
 *   cf. topics
 *   - This allows you to manually set the topics for the event filter.
 *   - If given the filter property and event signature, (topic[0]) will not
 *   - be set automatically.
 *
 * 2. event에 들어오는 값의 형태는 다음과 같다.
 * {
 *   anonymous: Bool,
 *   signature:
 *   name: String,
 *   inputs: [...],
 * }
 * cf) signature
 * - The signature’s hash of the event is one of the topics,
 * - unless you used the anonymous specifier to declare the event.
 * - This would mean filtering for anonymous, specific events by name is not possible.
 * - keccak256("burned(address,uint)") = 0x0970ce1235167a71...
 */
Contract.prototype._encodeEventABI = function (event, options) {
    options = options || {};
    var filter = options.filter || {},
        result = {};

    /**
     * parameter로 들어온 options에
     * 'fromBlock', 'toBlock'이 존재하면
     * 각각
     * result['fromBlock']과
     * result['toBlock']에 inputBlockNumberFormatter를 통해 포맷을 해준다.
     */
    ['fromBlock', 'toBlock'].filter(function (f) {
        return options[f] !== undefined;
    }).forEach(function (f) {
        result[f] = formatters.inputBlockNumberFormatter(options[f]);
    });

    // use given topics
    /**
     * options에 topics값이 있다면, topics를 그 값으로 달아준다.
     */
    if(_.isArray(options.topics)) {
        result.topics = options.topics;

    // create topics based on filter
    } else {
        /**
         * options에 topics값이 없다면, 일단 빈 배열을 생성하고
         * event.name이 'ALLEVENTS'가 아니라면,
         * 1) event inputs로 들어온 놈 중 'indexed'가 true인 값만 필터하고
         * 2) 걔네 중 filter[i.name]에 값이 있으면, caver-klay-abi 모듈을 통해 paramter를 encode한다.
         * 3) map 함수가 끝나고 그렇게 encode된 값들이 'indexedTopics'라는 값에 담기게 되고,
         * result.topics에 concat으로 달아준다.
         */
        result.topics = [];

        // add event signature
        if (event && !event.anonymous && event.name !== 'ALLEVENTS') {
            result.topics.push(event.signature);
        }

        // add event topics (indexed arguments)
        if (event.name !== 'ALLEVENTS') {
            var indexedTopics = event.inputs
            .filter(i => i.indexed === true)
            .map(i => {
              var value = filter[i.name]
              if (!value) return null

              // TODO: https://github.com/ethereum/web3.js/issues/344

              if (_.isArray(value)) {
                return value.map((v) => abi.encodeParameter(i.type, v))
              }
              return abi.encodeParameter(i.type, value)
            })

            result.topics = result.topics.concat(indexedTopics);
        }

        /**
         * 위의 topics 값 달아주는 과정을 거쳤는데도 result.topics가 빈배열이라면
         * 그냥 메모리에서 삭제해준다
         */
        if (!result.topics.length) delete result.topics
    }

    /**
     * this.options.address에 값이 있다면, LowerCase로 바꿔서 result.address에 달아준다.
     */
    if(this.options.address) {
        result.address = this.options.address.toLowerCase();
    }

    return result;
};

/**
 * Should be used to decode indexed params and options
 *
 * @method _decodeEventABI
 * @param {Object} data
 * @return {Object} result object with decoded indexed && not indexed params
 */

/**
 * _decodeEventABI
 * parameter인 data로 들어오는 값의 형태는 다음과 같다.
 * {
 *   data: String,
 *   topics: [...],
 * }
 */
Contract.prototype._decodeEventABI = function (data) {
    /**
     * 주로 _decodeEventABI.bind(...) bind 해서 쓰는 형태라
     * bind에 event를 달기 때문에, 명시적으로 'event'라는 이름으로 자기 컨텍스트 이름을 선언했다.
     * event는
     * {
     *   name: String,
     *   inputs: [...],
     *   jsonInterface: [...] 형태이다.
     * }
     */
    var event = this;

    data.data = data.data || '';
    data.topics = data.topics || [];
    var result = formatters.outputLogFormatter(data);

    // if allEvents get the right event
    if(event.name === 'ALLEVENTS') {
        event = event.jsonInterface.find(function (intf) {
            return (intf.signature === data.topics[0]);
        }) || {anonymous: true};
    }

    // create empty inputs if none are present (e.g. anonymous events on allEvents)
    event.inputs = event.inputs || [];

    /**
     * event가 anonymous라면, topics 그대로 argTopics로 주고,
     * anonymous로 설정되어있지 않으면 맨앞에꺼 하나 떼서 나머지들만 준다.
     * @todo 왜?
     * => 맨 앞에 있는 애는 event signature이고 (얘도 어쨌든 topic)이니까,
     * => 그 다음부터 오는 애들은 indexedTopics 이기 때문에, argTopics라는 이름으로 따로 떼어주는 것.
     */
    var argTopics = event.anonymous ? data.topics : data.topics.slice(1);

    /**
     * 본격적으로 결과값 셋팅해주는 부분.
     * result.returnValues, result.event, result.signature, result.raw(data와 topics)
     * 를 셋팅해준다.
     */
    result.returnValues = abi.decodeLog(event.inputs, data.data, argTopics);
    delete result.returnValues.__length__;

    // add name
    result.event = event.name;

    // add signature
    /**
     * @todo event가 anonymous라는 뜻은 signature가 없다는 뜻으로 이해하면 되나?
     */
    result.signature = (event.anonymous || !data.topics[0]) ? null : data.topics[0];

    // move the data and topics to "raw"
    result.raw = {
        data: result.data,
        topics: result.topics
    };
    delete result.data;
    delete result.topics;


    return result;
};

/**
 * Encodes an ABI for a method, including signature or the method.
 * Or when constructor encodes only the constructor parameters.
 *
 * @method _encodeMethodABI
 * @param {Mixed} args the arguments to encode
 * @param {String} the encoded ABI
 */
/**
 * _encodeMethodABI
 * _encodeMethodABI는 txObject에 bind되어서 사용된다.
 *
 */
Contract.prototype._encodeMethodABI = function _encodeMethodABI() {
    /**
     * this context에서 methodSignature와 args를 가져온다.
     */
    var methodSignature = this._method.signature,
        args = this.arguments || [];

    /**
     * 일단 signature라는 값을 false로 초기화 하고,
     * paramsABI라는 값을 만들어주는 과정을 시행한다. (filter 한번, map 두번)
     * @todo paramsABI라는 값의 정체는?
     */
    var signature = false,
        paramsABI = this._parent.options.jsonInterface.filter(function (json) {
            /**
             * _parent에 options에 붙은 jsonInterface를 돌면서,
             * i) methodSignature가 constructor이면서 json type과 methodSignature가 동일한 경우
             * ii) json signature와 methodSignature가 동일한 경우 && 이면서 json type이 'function'인 경우
             * iii) json signature와 methodSignature에서 '0x'라는 스트링을 뺐을 때가 동일한 경우 && 이면서 json type이 'function'인 경우
             * iv) json name과 methodSignature가 동일한 경우 && 이면서 json type이 'function'인 경우
             * 에 대해서만 값을 filter로 추려준다.
             */
            return ((methodSignature === 'constructor' && json.type === methodSignature) ||
                ((json.signature === methodSignature || json.signature === methodSignature.replace('0x','') || json.name === methodSignature) && json.type === 'function'));
        }).map(function (json) {
            /**
             * jsonABI의 inputs값이 배열이면 그 length를 뱉어주고, 없으면 0 으로 초기화.
             */
            var inputLength = (_.isArray(json.inputs)) ? json.inputs.length : 0;

            /**
             * ABI에서 정의되어 있는 length와 실제로 method encode 시 내가 준 argument랑
             * 숫자 차이가 나면, 에러를 뱉는다.
             */
            if (inputLength !== args.length) {
                throw new Error('The number of arguments is not matching the methods required number. You need to pass '+ inputLength +' arguments.');
            }

            /**
             * 처음에 false라는 값으로 초기화했던 signature라는 값을, json.signature로
             * 덮어준다.
             */
            if (json.type === 'function') {
                signature = json.signature;
            }
            /**
             * ABI에 inputs가 배열로서 존재하면 (json.inputs가 배열이라면)
             * json.inputs를 map을 돌면서 type만 쏙 빼줘서 다시 다음 map으로 넘긴다.
             * uint256, bytes32, address 이런 것들이 type이다.
             * 이런 식의 형태로 다음 map을 돌게 된다. ['uint256', 'bytes32', 'address']
             */
            return _.isArray(json.inputs) ? json.inputs : [];
        }).map(function (inputs) {
            /**
             * @todo abi 모듈에서 encodeParameters에 대한 기능을 먼저 보고 확인해보는 것으로.
             */
            return abi.encodeParameters(inputs, args).replace('0x','');
        })[0] || ''; // @todo 흠 이렇게 map으로 다 돌아서 배열만들어준 후 가장 첫번째 아이템만 뱉어준다?

    // return constructor
    /**
     * methodSignature가 constructor인 경우이면서 deployData가 존재하지 않는 경우에는 에러를 뱉는다.
     * @todo deployData가 존재한다면 deployData와 paramsABI 스트링을 합쳐준 값을 리턴한다.? 이 값이 뭐지?
     */
    if(methodSignature === 'constructor') {
        if(!this._deployData)
            throw new Error('The contract has no contract data option set. This is necessary to append the constructor parameters.');

        return this._deployData + paramsABI;

    // return method
    } else {
        /**
         * methodSignature가 'constructor'가 아니라면,
         * signature가 있다면 signature와 paramsABI를 붙인 값. (즉 스트링)
         * signature가 없다면 그냥 paramsABI만 리턴 해준다.
         */
        var returnValue = (signature) ? signature + paramsABI : paramsABI;

        /**
         * 위의 과정은 사실상 this._method.name에 박혀있는것을 JSON ABI 돌면서 찾아준다음에 꽂는 기능인데,
         * 위의 기능을 수행했는데도 paramsABI를 못찾았다는 것은, ABI에 실제로 this._method.name에 해당하는 값이
         * 없다는 뜻이 된다. 이 경우에는 못찾았다는 에러를 뱉는다.
         */
        if(!returnValue) {
            throw new Error('Couldn\'t find a matching contract method named "'+ this._method.name +'".');
        } else {
          /**
           * 위의 과정을 돌면서 paramsABI를 찾은 경우에는 returnValue를 리턴해준다.
           */
            return returnValue;
        }
    }

};


/**
 * Decode method return values
 *
 * @method _decodeMethodReturn
 * @param {Array} outputs
 * @param {String} returnValues
 * @return {Object} decoded output return values
 */
/**
 * _decodeMethodReturn
 * Array로 넘어온 outputs와 String으로 넘어온 returnValues에 대해서 decode해주는 메서드이다.
 */
Contract.prototype._decodeMethodReturn = function (outputs, returnValues) {
    /**
     * returnValues가 parameter로 넘어오지 않았다면 그냥 null을 리턴해준다.
     */
    if (!returnValues) {
        return null;
    }

    /**
     * returnValues라는 string이 2보다 길다면, 앞에 두 문자열을 떼준다.
     */
    returnValues = returnValues.length >= 2 ? returnValues.slice(2) : returnValues;
    /**
     * abi 모듈의 decodeParameters를 통해 outputs와 returnValues를 decode해준다.
     */
    var result = abi.decodeParameters(outputs, returnValues);

    /**
     * __length__라는 것은 abi 모듈의 decodeParamters를 돌고나면 생기는 것 같다.
     * 여튼, result가 1의 길이를 가진다면, result의 첫 번째 아이템을 리턴해준다.
     * result는 'decode output return values'로, Object의 형태를 띤다.
     */
    if (result.__length__ === 1) {
        return result[0];
    } else {
      /**
       * result.__length__가 1이 아니라면 result 그대로 리턴해준다.
       */
        delete result.__length__;
        return result;
    }
};


/**
 * Deploys a contract and fire events based on its state: transactionHash, receipt
 *
 * All event listeners will be removed, once the last possible event is fired ("error", or "receipt")
 *
 * @method deploy
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} EventEmitter possible events are "error", "transactionHash" and "receipt"
 */

/**
 * parameter로 들어오는 options의 형태는 다음과 같다.
 * options = {
 *   arguments: [...],
 *   data: ...,
 *
 * }
 */
Contract.prototype.deploy = function(options, callback){
    options = options || {};

    /**
     * options.arguments에 값이 있다면 그대로 쓰고, 없으면 빈 배열로 초기화.
     */
    options.arguments = options.arguments || [];
    options = this._getOrSetDefaultOptions(options);


    // return error, if no "data" is specified
    /**
     * deploy를 시도하려고 하는데 data가 없다는 것은 잘못된 것이기 때문에 에러를 뱉는다.
     */
    if(!options.data) {
        return utils._fireError(new Error('No "data" specified in neither the given options, nor the default options.'), null, null, callback);
    }

    var constructor = _.find(this.options.jsonInterface, function (method) {
        return (method.type === 'constructor');
    }) || {};
    constructor.signature = 'constructor';

    return this._createTxObject.apply({
        method: constructor,
        parent: this,
        deployData: options.data,
        _klayAccounts: this.constructor._klayAccounts
    }, options.arguments);

};

/**
 * Gets the event signature and outputformatters
 *
 * @method _generateEventOptions
 * @param {Object} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event options object
 */

/**
 * _on과 getPastEvents의 submethod로 쓰이는 함수이다.
 */
Contract.prototype._generateEventOptions = function() {
    var args = Array.prototype.slice.call(arguments);

    // get the callback
    /**
     * 보통 contract instance에 있는 event 관련 함수를 부르는 형태는
     * contractInstance.getPastEvents('MyEvent', {
     *   filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
     *   fromBlock: 0,
    *    toBlock: 'latest',
     * }, function(error, events){ console.log(events) })
     * 이런 식으로,
     * 첫 번째 parameter는 eventName,
     * 두 번째 parameter는 event option,
     * 세 번째 (마지막) parameter는 callback 함수 형태로 나오기 때문에,
     * getCallback 같은 함수는 사실상 마지막에 달려있는 argument를 빼내는 기능을 하는 것이라 볼 수 있다.
     * 여튼, getCallback 메서드를 통해 args에 달려있는 마지막 콜백을 pop으로 빼낸다.
     */
    var callback = this._getCallback(args);

    // get the options
    /**
     * callback이 빠진 후 args.length - 1에 있는게 보통 options 인데,
     * 이게 isObject 조건을 충족한다면, 확실하게 options라고 생각할 수 있으므로
     * pop을 해서 빼내고, 만약 없다면, 빈 object로 options를 초기화해준다.
     */
    var options = (_.isObject(args[args.length - 1])) ? args.pop() : {};

    /**
     * event 찾아서
     * {
     *   name: ...,
     *   jsonInterface: ...,
     * }
     * 형태화 해주는 과정.
     *
     * args[0]은 즉, 확실하게, 'eventName'을 말한다. 얘는 optional한 parameter가 아니기 때문.
     */
    var event = (_.isString(args[0])) ? args[0] : 'allevents';
    event = (event.toLowerCase() === 'allevents') ? {
            name: 'ALLEVENTS',
            jsonInterface: this.options.jsonInterface // 우리가 넘겨주는 ABI 배열(엄청 긴거)
        } : this.options.jsonInterface.find(function (json) {
            // 그 ABI 배열안에서 find로 우리가 eventName parameter에 주었던 스트링을 찾음.
            // json.name (이름으로 찾거나)
            // json.signature (시그니쳐, 즉 헥스 값으로 찾거나)
            return (json.type === 'event' && (json.name === event || json.signature === '0x'+ event.replace('0x','')));
        });

    /**
     * 위의 event를 찾고 이를
     * { name: ..., jsonInterface: ... } 형태로 만든 과정을 거쳤는데도,
     * event가 존재하지 않는다면, 컨트랙트 ABI 상에 event type이 없는 것이기 때문에,
     * 에러를 뱉어준다.
     * @todo 근데 이 에러가 뜨는 순간이 있긴한가? event에 args[0]에 값 없으면 무조건 'allevents' 값으로 초기화시켜주고,
     * { name: 'ALLEVENTS', jsonInterface: this.options.jsonInterface }로 값 만들어주는데?
     * => event parameter에 string을 넣긴 넣었는데 ABI에 실제로 없는 이벤트인 경우 에러가 뜰 것임.
     */
    if (!event) {
        throw new Error('Event "' + event.name + '" doesn\'t exist in this contract.');
    }

    /**
     * contract instance에 address가 안 달려있으면 address를 달아달라고 에러를 뱉는다.
     */
    if (!utils.isAddress(this.options.address)) {
        throw new Error('This contract object doesn\'t have address set yet, please set an address first.');
    }

    /**
     * params는 event와 options를 통해 encodeEventABI를 한 형태이고,
     * event는 'allevents'인 경우
     * {
     *   name: 'allevents',
     *   jsonInterface: ...
     * }
     * 의 형태,
     * 그 외의 경우는 ABI에서 가져온 event의 jsoninterface.
     * 형태를 가진다.
     */
    return {
        params: this._encodeEventABI(event, options),
        event: event,
        callback: callback
    };
};

/**
 * Adds event listeners and creates a subscription, and remove it once its fired.
 *
 * @method clone
 * @return {Object} the event subscription
 */

/**
 * new로 현재 constructor에 붙어있는 options 그대로 다시한번 construct해서 instance 새로 만드는 함수이다.
 */
Contract.prototype.clone = function() {
    return new this.constructor(this.options.jsonInterface, this.options.address, this.options);
};


/**
 * Adds event listeners and creates a subscription, and remove it once its fired.
 * (Subscribes to an event and unsubscribes immediately after the first event or error. Will only fire for a single event.)
 *
 *
 * @method once
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event subscription
 *
 * myContract.once('MyEvent', {
      filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0
  }, function(error, event){ console.log(event); });

  // event output example
  > {
      returnValues: {
          myIndexedParam: 20,
          myOtherIndexedParam: '0x123456789...',
          myNonIndexParam: 'My String'
      },
      raw: {
          data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
          topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
      },
      event: 'MyEvent',
      signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      logIndex: 0,
      transactionIndex: 0,
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      blockNumber: 1234,
      address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
  }
 */
Contract.prototype.once = function(event, options, callback) {
    var args = Array.prototype.slice.call(arguments);

    // get the callback
    callback = this._getCallback(args);

    if (!callback) {
        throw new Error('Once requires a callback as the second parameter.');
    }

    // don't allow fromBlock
    if (options)
        delete options.fromBlock;

    // don't return as once shouldn't provide "on"
    // 단순히 _on에 콜백에 바로 unsubscribe해주는 것이 once다.
    this._on(event, options, function (err, res, sub) {
        // once이기 때문에 바로 unsubscribe.
        sub.unsubscribe();
        if (_.isFunction(callback)){
            callback(err, res, sub);
        }
    });

    return undefined;
};

/**
 * Adds event listeners and creates a subscription.
 *
 * @method _on
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the event subscription
 */
Contract.prototype._on = function(){
    var subOptions = this._generateEventOptions.apply(this, arguments);


    // prevent the event "newListener" and "removeListener" from being overwritten
    this._checkListener('newListener', subOptions.event.name, subOptions.callback);
    this._checkListener('removeListener', subOptions.event.name, subOptions.callback);

    // TODO check if listener already exists? and reuse subscription if options are the same.

    // create new subscription
    // 결국, subscribe해주는 역할은 Subscription instance에서 한다.
    var subscription = new Subscription({
        subscription: {
            params: 1,
            inputFormatter: [formatters.inputLogFormatter],
            outputFormatter: this._decodeEventABI.bind(subOptions.event),
            // DUBLICATE, also in caver-klay
            subscriptionHandler: function (output) {
                this.emit('data', output)

                if (_.isFunction(this.callback))
                  this.callback(null, output, this)
            }
        },
        type: 'klay',
        requestManager: this._requestManager
    });
    subscription.subscribe('logs', subOptions.params, subOptions.callback || function () {});

    return subscription;
};

/**
 * Get past events from contracts
 *
 * @method getPastEvents
 * @param {String} event
 * @param {Object} options
 * @param {Function} callback
 * @return {Object} the promievent
 */

/**
 * 'klay_getLogs'를 보낼 수 있는 json rpc 콜 기능을 하는 함수이다.
 * 1) new Method 로 json rpc method 형태로 값을 만들어주고,
 * 2) setRequestManager로 requestmanager를 붙여주고,
 * 3) Method 인스턴스에 붙어있는 buildCall을 통해 call을 가져와서
 * 4) 마지막으로 call을 불러준다.
 *
 * myContract.getPastEvents('MyEvent', {
      filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0,
      toBlock: 'latest'
  }, function(error, events){ console.log(events); })
  .then(function(events){
      console.log(events) // same results as the optional callback above
  });

  > [{
      returnValues: {
          myIndexedParam: 20,
          myOtherIndexedParam: '0x123456789...',
          myNonIndexParam: 'My String'
      },
      raw: {
          data: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
          topics: ['0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7', '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385']
      },
      event: 'MyEvent',
      signature: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      logIndex: 0,
      transactionIndex: 0,
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      blockHash: '0xfd43ade1c09fade1c0d57a7af66ab4ead7c2c2eb7b11a91ffdd57a7af66ab4ead7',
      blockNumber: 1234,
      address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
  },{
      ...
  }]
 */
Contract.prototype.getPastEvents = function(){
    var subOptions = this._generateEventOptions.apply(this, arguments);

    var getPastLogs = new Method({
        name: 'getPastLogs',
        call: 'klay_getLogs',
        params: 1,
        inputFormatter: [formatters.inputLogFormatter],
        outputFormatter: this._decodeEventABI.bind(subOptions.event)
    });
    getPastLogs.setRequestManager(this._requestManager);
    var call = getPastLogs.buildCall();

    /**
     * call만 빼내고 getPastLogs는 null로 해준다.
     * @todo 굳이 이렇게 해주는 이유는?
     */
    getPastLogs = null;

    return call(subOptions.params, subOptions.callback);
};


/**
 * returns the an object with call, send, estimate functions
 *
 * @method _createTxObject
 * @returns {Object} an object with functions to call the methods
 */

/**
 * txObject를 만들어주는 과정인데,
 * 보통
 * func = _this._createTxObject.bind({
       method: method,
       parent: _this
   });
   이런 식으로 this를 bind 해줘서 만들어주기 때문에
   parent는 Contract instance를 가리키고,
   method는 ABI에서 빼낸 그 method이다.
 */
Contract.prototype._createTxObject =  function _createTxObject(){
    var args = Array.prototype.slice.call(arguments);
    var txObject = {};

    /**
     * _executeMethod에 bind할 때, 'call', 'send', 'estimate'를 같이 보낼 수 있는데,
     * 얘네가 우리가 정말 그 메서드 call하거나 send할 때 쓰이는 그것들이다.
     */
    if(this.method.type === 'function') {

        txObject.call = this.parent._executeMethod.bind(txObject, 'call');
        txObject.call.request = this.parent._executeMethod.bind(txObject, 'call', true); // to make batch requests

    }

    /**
     * txObject에 .send() 이걸 해줘야 진짜 send가 되는 것임.
     */
    txObject.send = this.parent._executeMethod.bind(txObject, 'send');
    txObject.send.request = this.parent._executeMethod.bind(txObject, 'send', true); // to make batch requests
    txObject.encodeABI = this.parent._encodeMethodABI.bind(txObject);
    txObject.estimateGas = this.parent._executeMethod.bind(txObject, 'estimate');

    if (args && this.method.inputs && args.length !== this.method.inputs.length) {
        if (this.nextMethod) {
            return this.nextMethod.apply(null, args);
        }
        throw errors.InvalidNumberOfParams(args.length, this.method.inputs.length, this.method.name);
    }

    txObject.arguments = args || [];
    txObject._method = this.method;
    txObject._parent = this.parent;
    txObject._klayAccounts = this.parent.constructor._klayAccounts || this._klayAccounts;

    if(this.deployData) {
        txObject._deployData = this.deployData;
    }

    return txObject;
};


/**
 * Generates the options for the execute call
 *
 * @method _processExecuteArguments
 * @param {Array} args
 * @param {Promise} defer
 */
Contract.prototype._processExecuteArguments = function _processExecuteArguments(args, defer) {
    var processedArgs = {};

    processedArgs.type = args.shift();

    // get the callback
    processedArgs.callback = this._parent._getCallback(args);

    // get block number to use for call
    if(processedArgs.type === 'call' && args[args.length - 1] !== true && (_.isString(args[args.length - 1]) || isFinite(args[args.length - 1])))
        processedArgs.defaultBlock = args.pop();

    // get the options
    processedArgs.options = (_.isObject(args[args.length - 1])) ? args.pop() : {};

    // get the generateRequest argument for batch requests
    processedArgs.generateRequest = (args[args.length - 1] === true)? args.pop() : false;

    processedArgs.options = this._parent._getOrSetDefaultOptions(processedArgs.options);
    processedArgs.options.data = this.encodeABI();

    // add contract address
    if(!this._deployData && !utils.isAddress(this._parent.options.address))
        throw new Error('This contract object doesn\'t have address set yet, please set an address first.');

    if(!this._deployData)
        // default address로 to를 설정
        processedArgs.options.to = this._parent.options.address;

    // return error, if no "data" is specified
    // execute call을 위해서는 options.data은 당연히 있어야 함. (estiamteGas, call, sendTransaction할 때 당연히 있어야 하는 것.)
    // @todo 이거로 어떤 함수를 부를 지 판단하는건가?
    if(!processedArgs.options.data)
        return utils._fireError(new Error('Couldn\'t find a matching contract method, or the number of parameters is wrong.'), defer.eventEmitter, defer.reject, processedArgs.callback);

    return processedArgs;
};

/**
 * Executes a call, transact or estimateGas on a contract function
 *
 * @method _executeMethod
 * @param {String} type the type this execute function should execute
 * @param {Boolean} makeRequest if true, it simply returns the request parameters, rather than executing it
 */

/**
 * call, sendTransaction, estimateGas 관장하는 가장 코어가 되는 internal 메서드
 */
Contract.prototype._executeMethod = function _executeMethod(){
    var _this = this,
        args = this._parent._processExecuteArguments.call(this, Array.prototype.slice.call(arguments), defer), // array형태의 argument를 object화 해줌.
        defer = utils.promiEvent((args.type !== 'send')),
        klayAccounts = _this.constructor._klayAccounts || _this._klayAccounts;

    // Not allow to specify options.gas to 0.
    if (args.options && args.options.gas === 0) {
      throw errors.notAllowedZeroGas()
    }
    /**
     * _processExecuteArguments를 거치고 난 후 args의 형태는 다음과 같다.
     * {
     *   type: ..., // 'call' || 'estimate' || 'send'
     *   defaultBlock: ...,
     *   callback: ...,
     *   options: {
     *     from: ...,
     *     value: ...,
     *     ...,
     *   }
     * }
     */

    // simple return request for batch requests
    if(args.generateRequest) {

        var payload = {
            params: [formatters.inputCallFormatter.call(this._parent, args.options)],
            callback: args.callback
        };

        if(args.type === 'call') {
            payload.params.push(formatters.inputDefaultBlockNumberFormatter.call(this._parent, args.defaultBlock));
            payload.method = 'klay_call';
            payload.format = this._parent._decodeMethodReturn.bind(null, this._method.outputs);
        } else {
            payload.method = 'klay_sendTransaction';
        }

        return payload;

    } else {

        switch (args.type) {
            case 'estimate':

                var estimateGas = (new Method({
                    name: 'estimateGas',
                    call: 'klay_estimateGas',
                    params: 1,
                    inputFormatter: [formatters.inputCallFormatter],
                    outputFormatter: utils.hexToNumber,
                    requestManager: _this._parent._requestManager,
                    accounts: klayAccounts, // is klay.accounts (necessary for wallet signing)
                    defaultAccount: _this._parent.defaultAccount,
                    defaultBlock: _this._parent.defaultBlock
                })).createFunction();

                return estimateGas(args.options, args.callback);

            case 'call':

                // TODO check errors: missing "from" should give error on deploy and send, call ?

                var call = (new Method({
                    name: 'call',
                    call: 'klay_call',
                    params: 2,
                    inputFormatter: [formatters.inputCallFormatter, formatters.inputDefaultBlockNumberFormatter],
                    // add output formatter for decoding
                    outputFormatter: function (result) {
                        return _this._parent._decodeMethodReturn(_this._method.outputs, result);
                    },
                    requestManager: _this._parent._requestManager,
                    accounts: klayAccounts, // is klay.accounts (necessary for wallet signing)
                    defaultAccount: _this._parent.defaultAccount,
                    defaultBlock: _this._parent.defaultBlock
                })).createFunction();

                return call(args.options, args.defaultBlock, args.callback);

            case 'send':

                // return error, if no "from" is specified
                if(!utils.isAddress(args.options.from)) {
                    return utils._fireError(new Error('No "from" address specified in neither the given options, nor the default options.'), defer.eventEmitter, defer.reject, args.callback);
                }

                if (_.isBoolean(this._method.payable) && !this._method.payable && args.options.value && args.options.value > 0) {
                    return utils._fireError(new Error('Can not send value to non-payable contract method or constructor'), defer.eventEmitter, defer.reject, args.callback);
                }


                // make sure receipt logs are decoded
                var extraFormatters = {
                    receiptFormatter: function (receipt) {
                        if (_.isArray(receipt.logs)) {

                            // decode logs
                            var events = _.map(receipt.logs, function(log) {
                                return _this._parent._decodeEventABI.call({
                                    name: 'ALLEVENTS',
                                    jsonInterface: _this._parent.options.jsonInterface
                                }, log);
                            });

                            // make log names keys
                            receipt.events = {};
                            var count = 0;
                            events.forEach(function (ev) {
                                if (ev.event) {
                                    // if > 1 of the same event, don't overwrite any existing events
                                    if (receipt.events[ev.event]) {
                                        if (Array.isArray(receipt.events[ ev.event ])) {
                                            receipt.events[ ev.event ].push(ev);
                                        } else {
                                            receipt.events[ev.event] = [receipt.events[ev.event], ev];
                                        }
                                    } else {
                                        receipt.events[ ev.event ] = ev;
                                    }
                                } else {
                                    receipt.events[count] = ev;
                                    count++;
                                }
                            });

                            delete receipt.logs;
                        }
                        return receipt;
                    },
                    contractDeployFormatter: function (receipt) {
                        var newContract = _this._parent.clone();
                        newContract.options.address = receipt.contractAddress;
                        return newContract;
                    }
                };

                var sendTransaction = (new Method({
                    name: 'sendTransaction',
                    call: 'klay_sendTransaction',
                    params: 1,
                    inputFormatter: [formatters.inputTransactionFormatter],
                    requestManager: _this._parent._requestManager,
                    accounts: _this.constructor._klayAccounts || _this._klayAccounts, // is klay.accounts (necessary for wallet signing)
                    defaultAccount: _this._parent.defaultAccount,
                    defaultBlock: _this._parent.defaultBlock,
                    extraFormatters: extraFormatters
                })).createFunction();

                return sendTransaction(args.options, args.callback);

        }

    }

};

module.exports = Contract;
