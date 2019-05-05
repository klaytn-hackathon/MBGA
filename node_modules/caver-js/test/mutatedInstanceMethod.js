const { expect } = require('chai')

describe('MutatedInstance', (done) => {
  it('should be different method provider host', (done) => {
    var Onit = require('../index.js')
    var onit1 = new Onit('http://www.naver.com')

    var onit2 = new Onit('http://aspen.klaytn.com')

    expect(onit1.klay.getBlockNumber.method.requestManager.provider.host).to.not.eql(onit2.klay.getBlockNumber.method.requestManager.provider.host)
    done()
  })

  it('should be different method provider object', (done) => {
    var Onit = require('../index.js')
    var onit1 = new Onit('http://www.naver.com')

    var onit2 = new Onit('http://aspen.klaytn.com')

    expect(onit1.klay.getBlockNumber.method.requestManager.provider).to.not.eql(onit2.klay.getBlockNumber.method.requestManager.provider)
    done()
  })
})
