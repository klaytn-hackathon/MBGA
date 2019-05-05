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
 * jsonrpc 초기화, messageId 는 항상 0 부터 시작한다.
 */
// Initialize Jsonrpc as a simple object with utility functions.
var Jsonrpc = {
    messageId: 0
};

/**
 * Should be called to valid json create payload object
 *
 * @method toPayload
 * @param {Function} method of jsonrpc call, required
 * @param {Array} params, an array of method params, optional
 * @returns {Object} valid jsonrpc payload object
 */
/**
 * jsonrpc 를 위한 유틸리티 함수
 * method와 params를 받아서 messageId를 하나씩 카운팅 올려주면서
 * jsonrpc에 맞는 메시지 규약으로 싸준다.
 * jsonrpc의 request object에 'method' property는 필수적으로 있어야 하기 때문에,
 * method가 존재하지 않는다면 에러를 뱉어준다.
 * 실행시마다 messageId 가 순차적으로 증가 됨
 * jsonrpc 버전은 2.0으로 고정 됨
 */
Jsonrpc.toPayload = function (method, params) {
    /**
     * parameter로 'method'가 안날아왔다면 에러 뱉기
     */
    if (!method) {
        throw new Error('JSONRPC method should be specified for params: "'+ JSON.stringify(params) +'"!');
    }

    /**
     * message를 jsonrpc 규약에 맞게 감쌀때마다 messageId 하나씩 올려주기.
     */
    Jsonrpc.messageId++;

    /**
     * jsonrpc 규약에 맞는 reqeust object로 변형.
     */
    return {
        jsonrpc: '2.0',
        id: Jsonrpc.messageId,
        method: method,
        params: params || []
    };
};

/**
 * jsonrpc 규약에 맞는 response object인지 확인해주는 함수.
 */
Jsonrpc.isValidResponse = function (response) {
    /**
     * response가 array로 들어올 경우에도 valid함을 판단하는데,
     * array의 native 메서드인 'every'를 통해서 배열 아이템 중 하나라도 valid하지 않다면 false를 뱉는다.
     * array가 아니라면, 하나의 response에 대해서만 validation을 거친다.
     */
    return Array.isArray(response) ? response.every(validateSingleMessage) : validateSingleMessage(response);

    /**
     * valid한 jsonrpc response란,
     * i) 당연히 message가 truthy한 값이며
     * ii) message.error가 없을 것이며,
     * iii) message.jsonrpc가 '2.0' 버전으로 선언되어 있어야 하며,
     * iv) message.id가 'number'나 'string' 타입중 하나여야 하며,
     * v) message.result가 정의되어 있어야 한다. (undefined가 아니어야 한다.)
     */
    function validateSingleMessage(message){
        /**
         * !! 은 null 을 배제하고 true or false 로 하기 위한 것
         * https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
         */
        return !!message &&
        !message.error &&
        message.jsonrpc === '2.0' &&
        (typeof message.id === 'number' || typeof message.id === 'string') &&
        message.result !== undefined; // only undefined is not valid json object
    }
};

/**
 * Batch Call 을 위한 payload 생성 유틸리티 함수
 * toBatchPayload 함수는 단순히, message가 배열로 날아왔을때, 이 각각 아이템들을 돌면서
 * 위에서 보았던 toPayload를 각각 적용해준 값을 다시금 배열로서 뱉는 함수이다.
 * ex) [{ method: 'A', params: 1 }, { method: 'B', params: 4 }, { method: 'C', params: 2 }]
 * 로 messages 배열이 구성되어 있었다면, toBatchPayload를 돌리고 난 후 리턴된 값은,
 * [
 *  { jsonrpc: '2.0', id: 0, method: 'A', params: 1 },
 *  { jsonrpc: '2.0', id: 1, method: 'B', params: 4 },
 *  { jsonrpc: '2.0', id: 2, method: 'C', params: 2 },
 * ]
 * 가 되는 것이다.
 */
Jsonrpc.toBatchPayload = function (messages) {
    return messages.map(function (message) {
        return Jsonrpc.toPayload(message.method, message.params);
    });
};

module.exports = Jsonrpc;
