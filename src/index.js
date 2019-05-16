import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'mobx-react';

import App from './App';
// import renderRoutes from './routes';
import AuthStore from './models/AuthStore';
import ContractStore from './models/ContractStore';

const authStore = new AuthStore();
const contractStore = new ContractStore();

// Render App(root component).
ReactDOM.render(
  <Provider 
    auth={authStore}
    contract={contractStore}
  >
    <App/>
  </Provider>,
  document.getElementById('root')
)

// hot module replacement.
// : If file changed, re-render root component(App.js).
if (module.hot) {
  module.hot.accept('./App.js', () => {
    const NextApp = require('./App').default
    ReactDOM.render(NextApp, document.getElementById('root'))
    console.log('Hot module replaced..')
  })
}
