require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

const helpers = rootRequire('caver-core-helpers')

let caver

beforeEach(() => {
  caver = new Caver(testRPCURL)
})

describe('accounts.wallet.add', () => {
  context('Add humanreadable address', () => {
    it('should have humanreadable address and humanreadable string in caver.klay.accounts.wallet', () => {
      const privateKey = '0xf07e85ad4c968e3f2552d56deeb99808e57d7d042cad49a3b372ff4737f053ae'

      const humanReadableString = 'satoshi'
      const humanReadableAddress = caver.utils.humanReadableStringToHexAddress(humanReadableString)

      caver.klay.accounts.wallet.add(privateKey, humanReadableString)

      expect(caver.klay.accounts.wallet[0]).to.exist
      expect(caver.klay.accounts.wallet[humanReadableString]).to.exist
      expect(caver.klay.accounts.wallet[humanReadableAddress]).to.exist
      expect(caver.klay.accounts.wallet[humanReadableAddress.toLowerCase()]).to.exist
      expect(caver.klay.accounts.wallet.length).to.equal(1)
    })
  })

  context('Remove humanreadable address', () => {
    it('should not have humanreadable address and humanreadable string in caver.klay.accounts.wallet', () => {
      const privateKey = '0xf07e85ad4c968e3f2552d56deeb99808e57d7d042cad49a3b372ff4737f053ae'

      const humanReadableString = 'satoshi'

      caver.klay.accounts.wallet.add(privateKey, humanReadableString)
      caver.klay.accounts.wallet.remove(humanReadableString)

      expect(caver.klay.accounts.wallet[0]).not.to.exist
      expect(caver.klay.accounts.wallet[humanReadableString]).not.to.exist
      expect(caver.klay.accounts.wallet[caver.utils.humanReadableStringToHexAddress(humanReadableString)]).not.to.exist
      expect(caver.klay.accounts.wallet.length).not.to.equal(1)
    })
  })

  context('Clear humanreadable address', () => {
    it('should not have humanreadable address and humanreadable string in caver.klay.accounts.wallet', () => {
      const privateKey = '0xf07e85ad4c968e3f2552d56deeb99808e57d7d042cad49a3b372ff4737f053ae'

      const humanReadableString = 'satoshi'

      caver.klay.accounts.wallet.add(privateKey, humanReadableString)
      caver.klay.accounts.wallet.clear()

      expect(caver.klay.accounts.wallet[0]).not.to.exist
      expect(caver.klay.accounts.wallet[humanReadableString]).not.to.exist
      expect(caver.klay.accounts.wallet[caver.utils.humanReadableStringToHexAddress(humanReadableString)]).not.to.exist
      expect(caver.klay.accounts.wallet.length).not.to.equal(1)
    })
  })
})
