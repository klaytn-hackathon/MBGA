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
 * Destructured Manager, BacthManager from requestmanager file. 2018-07
 * Removed addProviders function. 2018-07
 * Refactored preventing `setProvider` overwritng logic. 2018-07
 * Changed name to caver.js 2018-10
 */

const { Manager, BatchManager } = require('../../caver-core-requestmanager')
const formatters = require('../../caver-core-helpers').formatters
const Method = require('../../caver-core-method')
const utils = require('../../caver-utils')

// extend
const extend = (pkg) => {
  const ex = (extension) => {
    let extendedObject = pkg

    if (extension.property) {
      extendedObject = pkg[extension.property] = pkg[extension.property] || {}
    }

    if (extension.methods) {
      extension.methods.forEach((method) => {
        if(!(method instanceof Method)) {
          method = new Method(method)
        }

        method.attachToObject(extendedObject)
        method.setRequestManager(pkg._requestManager)
      })
    }

    return pkg
  }

  ex.formatters = formatters
  ex.utils = utils
  ex.Method = Method

  return ex
}

module.exports = {
  packageInit: function (pkg, [provider, net]) {
    if (!pkg) throw new Error('You need to instantiate using the "new" keyword.')

    if (provider && provider._requestManager) {
      pkg._requestManager = new Manager(provider.currentProvider)
    // set requestmanager on package
    } else {
      pkg._requestManager = new Manager(provider, net)
    }

    pkg.providers = Manager.providers

    pkg._provider = pkg._requestManager.provider
    pkg.currentProvider = pkg._provider

    // add SETPROVIDER function (don't overwrite if already existing)
    if (!pkg.setProvider) {
      pkg.setProvider = (provider, net) => pkg._provider = pkg._requestManager.setProvider(provider, net).provider
    }

    // attach batch request creation
    pkg.BatchRequest = BatchManager.bind(null, pkg._requestManager)
  },
  providers: Manager.providers,
}
