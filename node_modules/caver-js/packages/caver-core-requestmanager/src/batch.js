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

var Jsonrpc = require('./jsonrpc');
var errors = require('../../caver-core-helpers').errors;

/**
 * requestManager를 parameter로 받아서 bind하는 식으로 사용한다.
 * 사용 예)
 * web3-core `index.js`
 * pkg.BatchRequest = requestManager.BatchManager.bind(null, pkg._requestManager);
 * 이 후 this.requestManager 로 접근하여 request manager에 있는 메서드들을 사용하는 방식이다. (ex: sendBatch)
 * batch로 보낼 request들을 'requests'라고 하는 배열에 'add' 메서드를 통해 담아두고
 * 'execute' 메서드를 통해서 'requests' 배열을 .sendBatch의 parameter로 넘기고,
 * 그에 해당하는 콜백들을 'requests' 배열의 아이템들을 모두 돌면서 실행한다.
 */
var Batch = function (requestManager) {
    this.requestManager = requestManager;
    this.requests = [];
};

/**
 * request를 'requests'라는 배열에 담는다.
 */
Batch.prototype.add = function (request) {
    this.requests.push(request);
};

/**
 * 'requests' 배열을 requestManager의 sendBatch의 parameter로 넘기고,
 * 그에 해당하는 콜백을 'requests' 배열의 모든 아이템들을 돌면서 실행한다.
 */
Batch.prototype.execute = function () {
    var requests = this.requests;
    this.requestManager.sendBatch(requests, function (err, results) {
        /**
         * 결과 값들이 들어있는 results를 사용하되, 값이 없다면 빈 배열로 값을 초기화 해준다.
         */
        results = results || [];
        /**
         * 'requests' 배열에 있는 아이템들을 돌면서, 여기서 index만 빼서 results[index]를
         * 값으로 하는 새 배열을 만들어 준다.
         * 이 의미는, 결국에 requests 배열 안에 있는 아이템들은 쓰지 않는다는 건데,
         * 그 이유는 requestManager의 sendBatch 메서드에 'requests' 배열을 parameter로
         * 넣어서 보낸 후 불리는 콜백에 담기는 results에 이미 'requests'의 값들이 반영된 것들이
         * 들어있기 때문이라고 보인다. 따라서 requests에서는 index만 빼내는 것임.
         */
        requests.map(function (request, index) {
            return results[index] || {};
        }).forEach(function (result, index) {
          /**
           * requests[index]에 callback이 정의되어 있으면
           * 1) result.error가 있는지 체크 - 있으면 ErrorResponse 날려줌.
           * 2) result값이 valid한 json response object인지 체크 - valid하지 않으면 InvalidResponse 날려줌.
           * 3) 1) 2)를 통과한 경우, requests[index]에 format 메서드가 있다면, formatting 해주고,
           * 없으면 그대로 콜백의 parameter로 넘김.
           */
            if (requests[index].callback) {

                if (result && result.error) {
                    return requests[index].callback(errors.ErrorResponse(result));
                }

                if (!Jsonrpc.isValidResponse(result)) {
                    return requests[index].callback(errors.InvalidResponse(result));
                }

                requests[index].callback(null, (requests[index].format ? requests[index].format(result.result) : result.result));
            }
        });
    });
};

module.exports = Batch;
