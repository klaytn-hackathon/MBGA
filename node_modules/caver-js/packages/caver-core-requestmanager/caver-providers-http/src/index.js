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

// Changed name to caver.js 2018-10

var errors = require('../../../caver-core-helpers').errors;
/**
 * xhr2
 * xhr2 library는 w3c 규약에 맞는 XMLHttpRequest 구현체 라이브러리이다.
 */
var XHR2 = require('xhr2-cookies').XMLHttpRequest

/**
 * HttpProvider should be used to send rpc calls over http
 */
/**
 * @param       {string} host
 * @param       {object} options
 * @constructor
 * host와 options에 있는 값으로 해당 instance의 값을 채워준다.
 * construct 한 후 connecetd는 당연히 (현재 접속이 안되어있기 때문에) false이다.
 * 'host', 'timeout', 'headers', 'connected' property를 가진다.
 */
var HttpProvider = function HttpProvider(host, options) {
    options = options || {};
    /**
     * host를 따로 지정해주지 않으면 localhost 8545포트를 기본으로 host로 잡아준다.
     */
    this.host = host || 'http://localhost:8545';
    this.timeout = options.timeout || 0;
    this.headers = options.headers;
    this.connected = false;
};

/**
 * _prepareRequest
 * 말 그대로 request instance를 만들어주는 역할을 하는 함수이다.
 * 1) XHR2를 통해 xhr request instance를 만들고,
 * 2) 'POST' 메서드로 지정하고, constructor에서 지정된 host값을 host로 사용하고,
 *    async한 send에 대해서 true로 지정해준다.
 * 3) json rpc를 보낼 것이기 때문에, requestHeader를 Content-type 'application/json'으로 해준다.
 * 4) instance에 timeout이 지정되어 있으면서 && 그 값이 1이 아니라면 그 값을 그대로 쓰고,
 *    반대의 경우 0을 timeout으로 한다.
 * 5) instance에 headers가 있으면 각각 돌면서 setRequestHeader로 header name과 header value를 넣어준다.
 * 6) 1~5 과정을 통해 구성된 request instance를 리턴한다.
 */
HttpProvider.prototype._prepareRequest = function(){
    var request = new XHR2();

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type','application/json');
    request.timeout = this.timeout && this.timeout !== 1 ? this.timeout : 0;

    if(this.headers) {
        this.headers.forEach(function(header) {
            request.setRequestHeader(header.name, header.value);
        });
    }

    return request;
};

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */

/**
 * 직접적으로 rpc request를 날리는 함수이다.
 * 다음과 같은 기능을 수행하게끔 구성되어 있다.
 * 1) onreadystatechange - request를 보낸 후 response가 왔을 때의 수행할 콜백
 * 2) ontimeout - timeout 상황 발생 시 수행할 콜백
 * 3) send에 대한 try, catch -
 */
HttpProvider.prototype.send = function (payload, callback) {
  var _this = this;

  _this.send(payload, callback)
};

HttpProvider.prototype.send = function(payload, callback) {
  var _this = this;
  var request = this._prepareRequest();

  request.onreadystatechange = function() {
      /**
       * readystate 값
       * 0: UNSENT - client가 created되었을 때
       * 1: OPENED - request가 open 되었을 때
       * 2: HEADERS_RECEIVED - send가 불리고 headers와 status가 available할 때
       * 3: LOADING - downloading
       * 4: DONE - request를 수행하고 response가 왔을 때.
       * @todo request.timeout !== 1의 의미
       * @body constructor에서도 그렇고 timeout이 1인 상황을 왜 거부할까? (request.timeout !== 1)
       */
      if (request.readyState === 4 && request.timeout !== 1) {
          /**
           * response가 날아오면 그 값이 request.responseText에 담기게 된다.
           */
          var result = request.responseText;
          /**
           * error 값을 null로 초기화 해준다.
           */
          var error = null;

          /**
           * 날아온 responseText(JSON)를 parse한다.
           * 만약 실패 시 InvalidResponse 메시지를 보여준다.
           */
          try {
              result = JSON.parse(result);
          } catch(e) {
              error = errors.InvalidResponse(request.responseText);
          }

          /**
           * HttpProvider instnace의 connected property를 true로 해준다.
           */
          _this.connected = true;
          /**
           * send하고 난 후 실행 할 콜백(.send 메서드의 parameter로 들어오는)을 수행한다.
           */
          callback(error, result);
      }
  };

  /**
   * ontimeout
   * timeout이 발생하면 HttpProvider instance의 connected를 false로 하고
   * ConnectionTimeout이라는 error message를 콜백으로 수행한다.
   */
  request.ontimeout = function() {
      _this.connected = false;
      callback(errors.ConnectionTimeout(this.timeout));
  };

  try {
      request.send(JSON.stringify(payload));
  } catch(error) {
      this.connected = false;
      callback(errors.InvalidConnection(this.host));
  }
}

module.exports = HttpProvider;
