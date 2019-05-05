const { expect } = require('chai')
const { errors } = require('../packages/caver-core-helpers')

describe('wrap error to core-helper/errors', (done) => {
  it('should be thrown property missing error when "call" missing', (done) => {
    var Onit = require('../index.js')

    var onit1 = new Onit('http://aspen.klaytn.com')

    expect(() => new onit1.Method({ name: 'hi' }))
      .to
      .throw(errors['needNameCallPropertyToCreateMethod'])
    done()
  })

  it('should be thrown property missing error when "name" missing', (done) => {
    var Onit = require('../index.js')

    var onit1 = new Onit('http://aspen.klaytn.com')

    expect(() => new onit1.Method({ call: 'hi' }))
      .to
      .throw(errors['needNameCallPropertyToCreateMethod'])
    done()
  })

  it('should not be thrown property missing error when "name", "call" existing', (done) => {
    var Onit = require('../index.js')

    var onit1 = new Onit('http://aspen.klaytn.com')

    expect(() => new onit1.Method({ name: 'hi', call: 'hi' }))
      .not.to
      .throw(errors['needNameCallPropertyToCreateMethod'])
    done()
  })
})
