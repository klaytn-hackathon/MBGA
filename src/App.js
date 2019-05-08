import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './components/Login';
import LogoutBtn from './components/LogoutBtn';
@inject('auth')
@observer
class App extends Component {
  componentWillMount() {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if (walletFromSession) {
      try {
        const { auth } = this.props;
        auth.setPrivateKey(JSON.parse(walletFromSession).privateKey);
        auth.login();
      } catch (e) {
        sessionStorage.removeItem('walletInstance');
      }
    }
  }

  render() {
    const { auth } = this.props;
    return (
      <div className="App">
        {auth.values.isLoggedIn ? <LogoutBtn/> : <Login/>}
      </div>
    )
  }
}

export default App;