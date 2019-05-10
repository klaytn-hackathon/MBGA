import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import LoginPage from './pages/LoginPage';
import RenderingPage from './pages/RenderingPage';
import Header from './components/Header';

@inject('auth')
@observer
class App extends Component {
  componentWillMount() {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if (walletFromSession) {
      try {
        const { auth } = this.props;
        auth.login(JSON.parse(walletFromSession).privateKey);
      } catch (e) {
        sessionStorage.removeItem('walletInstance');
      }
    }
  }

  render() {
    const { auth } = this.props;
    return (
      <div className="App">
        {
          auth.values.isLoggedIn ? <div>
            <Header/>
            <RenderingPage/>
          </div> : <LoginPage/>
        }
      </div>
    );
  }
}

export default App;