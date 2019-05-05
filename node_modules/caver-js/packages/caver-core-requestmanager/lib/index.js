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

var errors = rootRequire('caver-core-helpers').errors;
const middleware = rootRequire('caver-middleware');
/**
 * Jsonrpc library
 * 이 라이브러리를 통해 수행하는 기능은 세 가지 이다.
 * 1) Jsonrpc.toPayload 블록체인에 메시지를 보낼 때 method와 parameter를 jsonrpc 규약에 맞는 메시지로 변형해준다.
 * 2) Jsonrpc.isValidResponse jsonrpc 규약에 맞는 메시지 형식인지 확인한다.
 * 3) Jsonrpc.toBatchPayload 블록체인에 batch로 메시지를 보낼 때 사용된다.
 * 위 기능들은 RequestManager에서는 .send, .sendBatch에서 사용된다.
 *
 */

var Jsonrpc = require('./jsonrpc.js');
/**
 * BatchManager library
 * BatchManager는 json rpc 메시지를 batch 형식으로 보낼수 있게끔 도와주는 라이브러리이다.
 * 위 기능은 RequestManager에서 따로 함수를 파서 사용되는건 아니고, 그냥 RequestManager에 모듈로서 붙어있는 형태이다.
 * ex) RequestManager.BatchManager
 */


var BatchManager = require('./batch.js');
/**
 * RequestManager의 constructor 함수인데, provider를 parameter로 받는다.
 * 기능은 다음과 같다.
 * 1) 각 값들 초기화 - provider는 null로, providers는 초기에 지정된 providers로,
 *    subscriptions는 빈 object로
 * 2) 받은 provider를 .setProvider라는 함수를 불러서 이 RequestManager instance의 provider로 사용한다.
 */


var RequestManager = function RequestManager(provider, net) {
  this.provider = null;
  this.providers = RequestManager.providers;
  this.setProvider(provider, net);
  this.subscriptions = {};
};
/**
 * 기본적으로 RequestManager.providers에서 가져다 쓸 수 있는 provider들에 대해서 정의되어 있다.
 */


RequestManager.providers = {
  WebsocketProvider: require('../caver-providers-ws'),
  HttpProvider: require('../caver-providers-http'),
  IpcProvider: require('../caver-providers-ipc')
  /**
   * Should be used to set provider of request manager
   *
   * @method setProvider
   * @param {Object} p
   */

  /**
   * RequestManager의 provider를 셋팅하는 함수로,
   * p라는 parameter와 net이라는 optional parameter를 받는데,
   * p는 'http://127.0.0.1:22000' 혹은 'ws://127.0.0.1:8546' 이런 식으로 받는 스트링을 말한다.
   * p로 들어온 스트링을 정규식 체크를 통해서 각각 HttpProvider로 들어갈 주소인지, WebsocketProvider로 들어갈 주소인지,
   * IpcProvider로 들어갈 주소인지를 판단해서 this.provider를 설정해주고, 이미 provider가 존재한다면,
   * 그에 대한 subscription을 모두 날리고, 새로 .on 을 통해 들어오는 메시지를 listening 한다.
   * 이 때 추가적으로 콜백처리도 수행해준다.
   */

};

RequestManager.prototype.setProvider = function (p, net) {
  var _this = this;
  /**
   * p로 들어온 스트링 정규식 체크
   */


  if (p && typeof p === 'string' && this.providers) {
    // HTTP
    if (/^http(s)?:\/\//i.test(p)) {
      p = new this.providers.HttpProvider(p); // WS
    } else if (/^ws(s)?:\/\//i.test(p)) {
      p = new this.providers.WebsocketProvider(p); // IPC
    } else if (p && typeof net === 'object' && typeof net.connect === 'function') {
      p = new this.providers.IpcProvider(p, net);
    } else if (p) {
      throw new Error('Can\'t autodetect provider for "' + p + '"');
    }
  }
  /**
   * 기존에 provider가 잡혀있었다면 거기에 subscription을 날려줘야하기 때문에
   * .clearSubscriptions() 함수 실행
   */


  if (this.provider) this.clearSubscriptions();
  this.provider = p || null;
  /**
   * 위의 과정들을 통해 셋팅된 provider가 ipc provider라면 .on 함수를 통해 message listening을 해준다.
   * ipc provider만 .on을 구현하였다.
   */
  // listen to incoming notifications

  if (this.provider && this.provider.on) {
    this.provider.on('data', function requestManagerNotification(result, deprecatedResult) {
      /**
       * result외에 deprecatedResult라는 parameter를 optional하게 받는 것 같은데,
       * 'error' 를 첫 parameter로 받는 형식을 가진 구버전 프로바이더를 지원하기 위함이라고 한다.
       */
      result = result || deprecatedResult; // this is for possible old providers, which may had the error first handler

      /**
       * 여기서 .on('data')로 받는 result에 들어가는게 jsonrpc response인지 jsonrpc request인지 헷갈린다.
       * > response 가 맞다. 아래코드는 ipc 에서만 사용하는 코드이다.
       */
      // check for result.method, to prevent old providers errors to pass as result

      if (result.method && _this.subscriptions[result.params.subscription] && _this.subscriptions[result.params.subscription].callback) {
        _this.subscriptions[result.params.subscription].callback(null, result.params.result);
      }
    }); // TODO add error, end, timeout, connect??
    // this.provider.on('error', function requestManagerNotification(result){
    //     Object.keys(_this.subscriptions).forEach(function(id){
    //         if(_this.subscriptions[id].callback)
    //             _this.subscriptions[id].callback(err);
    //     });
    // }
  }

  return this;
};
/**
 * Should be used to asynchronously send request
 *
 * @method sendAsync
 * @param {Object} data
 * @param {Function} callback
 */

/**
 * send는 받은 data parameter를 현재 this.provider에 .sendAsync 메서드가 있다면 .sendAsync를 호출하고, 그렇지 않다면 .send를 호출하는 wrapper function 이다.
 * 호출하기 전에 Jsonrpc.toPayload 메서드를 이용하여
 * data parameter를 jsonrpc 규약에 맞는 메시지로 바꿔준다.
 * 그 후 몇 가지 체크를 통해 에러를 걸러내고, 모든 조건을 통과했을 때 parameter에 있는 콜백함수(callback) 실행
 */


RequestManager.prototype.send = function (data, callback) {
  callback = callback || function () {};

  if (!this.provider) {
    return callback(errors.InvalidProvider());
  }

  var payload = Jsonrpc.toPayload(data.method, data.params);
  /**
   * send, async 구현상황
   * httpProvider - send
   * ipcProvider - send
   * wsProvider - send
   *
   * // ? sendAsync를 구현한 프로바이더가 없다. 미래를 위해 만들어 놓은듯?
   */

  const isMiddlewareExist = middleware.getMiddlewares().length !== 0;
  if (!isMiddlewareExist) return sendRPC(this.provider)(payload); // Attach outbound middleware

  middleware.applyMiddleware(payload, 'outbound', sendRPC(this.provider));

  function sendRPC(provider) {
    return function (payload) {
      provider[provider.sendAsync ? 'sendAsync' : 'send'](payload, function (err, result) {
        // Attach inbound middleware
        if (isMiddlewareExist) middleware.applyMiddleware(payload, 'inbound');
        /**
         * result = json rpc response object
         * {
         *  jsonrpc: '2.0'
         *  result: ...,
         *  id: ...,
         *  error: ...,
         * }
         *
         * Reference: https://www.jsonrpc.org/specification
         */

        if (result && result.id && payload.id !== result.id) return callback(new Error('Wrong response id "' + result.id + '" (expected: "' + payload.id + '") in ' + JSON.stringify(payload)));
        if (err) return callback(err);
        if (result && result.error) return callback(errors.ErrorResponse(result));
        if (!Jsonrpc.isValidResponse(result)) return callback(errors.InvalidResponse(result));
        callback(null, result.result);
      });
    };
  }
};
/**
 * Should be called to asynchronously send batch request
 *
 * @method sendBatch
 * @param {Array} batch data
 * @param {Function} callback
 */


RequestManager.prototype.sendBatch = function (data, callback) {
  if (!this.provider) {
    return callback(errors.InvalidProvider());
  }

  var payload = Jsonrpc.toBatchPayload(data);
  this.provider[this.provider.sendAsync ? 'sendAsync' : 'send'](payload, function (err, results) {
    if (err) {
      return callback(err);
    }

    if (!_.isArray(results)) {
      return callback(errors.InvalidResponse(results));
    }

    callback(null, results);
  });
};
/**
 * Waits for notifications
 *
 * @method addSubscription
 * @param {String} id           the subscription id
 * @param {String} name         the subscription name
 * @param {String} type         the subscription namespace (eth, personal, etc)
 * @param {Function} callback   the callback to call for incoming notifications
 */

/**
 * addSubscription은 subscription을 추가하는 함수로,
 * this.provider에 on이 달려있으면, this(RequestManager instance)에 subscription을 등록한다.
 * id, callback, type, name을 parameter로 받아서 등록하는데,
 * type은 말 그대로 어떤 type인지, 단순 namespace로서의 기능.
 */


RequestManager.prototype.addSubscription = function (id, name, type, callback) {
  if (this.provider.on) {
    this.subscriptions[id] = {
      callback: callback,
      type: type,
      name: name
    };
  } else {
    throw new Error('The provider doesn\'t support subscriptions: ' + this.provider.constructor.name);
  }
};
/**
 * Waits for notifications
 *
 * @method removeSubscription
 * @param {String} id           the subscription id
 * @param {Function} callback   fired once the subscription is removed
 */

/**
 * removeSubscription은 말 그대로 subscription을 제거하는 함수로,
 * rpc 콜을 통해 _unsubscribe 메시지를 프로바이더에 보내고,
 * id를 parameter로 해서 subscriptions에 붙어 있는 subscriptions를 메모리에서 삭제해준다.
 */


RequestManager.prototype.removeSubscription = function (id, callback) {
  var _this = this;

  if (this.subscriptions[id]) {
    this.send({
      method: this.subscriptions[id].type + '_unsubscribe',
      params: [id]
    }, callback); // remove subscription

    delete _this.subscriptions[id];
  }
};
/**
 * Should be called to reset the subscriptions
 *
 * @method reset
 */

/**
 * this.subscriptions에 붙어있는 모든 id값들을 돌면서, 그 subscription의 name이 'syncing'인
 * 경우를 제외하고 모두 메모리에서 날려버린다.(위에서 본 _removeSubscription을 통해)
 * 그 후 provider에 붙어있는 .reset 메서드를 실행하는데, .reset 메서드가 붙어있는 프로바이더는
 * WebsocketProvider와 IpcProvider의 경우에만 붙어있다. (HttpProvider에는 .reset 메서드 존재하지 않음.)
 */


RequestManager.prototype.clearSubscriptions = function (keepIsSyncing) {
  var _this = this; // uninstall all subscriptions


  Object.keys(this.subscriptions).forEach(function (id) {
    if (!keepIsSyncing || _this.subscriptions[id].name !== 'syncing') _this.removeSubscription(id);
  }); //  reset notification callbacks etc.

  if (this.provider.reset) this.provider.reset();
};

module.exports = {
  Manager: RequestManager,
  BatchManager: BatchManager
};