function randomHex(size, callback) {
  const crypto = require('./crypto.js')
  const isCallback = typeof callback === 'function'

  if (size < 0 || size > 65536) {
    if (isCallback) {
      callback(new Error('Invalid size: It must be >=0 && <= 65536'))
    } else {
      throw new Error('Invalid size: It must be >=0 && <= 65536')
    }
  }

  // If environment is in node
  if (typeof crypto !== 'undefined' && crypto.randomBytes) {
    if (isCallback) {
      crypto.randomBytes(size, (err, result) => {
        if (!err) {
          callback(null, '0x' + result.toString('hex'))
        } else {
          callback(error)
        }
      })
    } else {
      return '0x' + crypto.randomBytes(size).toString('hex')
    }

  // If environment is in browser
  } else {
    let cryptoLib
    if (typeof crypto !== 'undefined') {
      cryptoLib = crypto
    } else if (typeof msCrypto !== 'undefined') {
      cryptoLib = msCrypto
    }

    if (cryptoLib && cryptoLib.getRandomValues) {
      const randomBytes = cryptoLib.getRandomValues(new Uint8Array(size))
      const returnValue = '0x' + Array.from(randomBytes).map((arr) => arr.toString(16)).join('')

      if (isCallback) {
        callback(null, returnValue)
      } else {
        return returnValue
      }

    // crypto object is missing in browser.
    } else {
      const error = new Error('"crypto" object does not exist. This Browser does not support generating secure random bytes.')

      if (isCallback) {
        callback(error)
      } else {
        throw error
      }
    }
  }
}


module.exports = randomHex
