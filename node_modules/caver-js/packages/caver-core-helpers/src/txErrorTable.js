/**
 * Copyright 2018 The caver-js Authors
 * This file is part of the caver-js library.
 *
 * The caver-js library is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The caver-js library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with the go-klayton library. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @file txErrorTable.js
 * @author Hoonil Kim <satoshi.kim@groundx.xyz>
 * @date 2018
 */

const txErrorTable = {
  "0x2": 'runtime error occurred in interpreter',
  "0x3": 'max call depth exceeded',
  "0x4": 'contract address collision',
  "0x5": 'contract creation code storage out of gas',
  "0x6": 'evm: max code size exceeded',
  "0x7": 'out of gas',
  "0x8": 'evm: write protection',
  "0x9": 'evm: execution reverted',
  "0xa": 'reached the opcode count limit',
  "0xb": 'account already exists',
  "0xc": 'not a program account (e.g., an account having code and storage)',
  "0xd": 'not a human readable address',
  "0xe": "fee ratio is out of range [1, 99]", 
  "0xf": "AccountKeyFail is not updatable", 
  "0x10": "different account key type", 
  "0x11": "AccountKeyNil cannot be initialized to an account", 
  "0x12": "public key is not on curve", 
  "0x13": "key weight is zero", 
  "0x14": "key is not serializable", 
  "0x15": "duplicated key", 
  "0x16": "weighted sum overflow", 
  "0x17": "unsatisfiable threshold. Weighted sum of keys is less than the threshold.", 
  "0x18": "length is zero", 
  "0x19": "length too long", 
  "0x1a": "nested role-based key", 
}

module.exports = txErrorTable
