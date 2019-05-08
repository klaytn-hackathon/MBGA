import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Login from './components/Login';
import RenderingPage from './pages/RenderingPage';
import Header from './components/Header';

@inject('auth')
@observer
class App extends Component {
  componentWillMount() {
    console.log('here');
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
      <div>
        <div className="App">
          {
            auth.values.isLoggedIn ? <div>
              <Header/>
              <RenderingPage/>
            </div> : <Login/>
          }
        </div>
      </div>
    );
  }
}

export default App;