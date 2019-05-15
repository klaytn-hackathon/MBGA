import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Layout } from 'antd';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RenderingPage from './pages/RenderingPage';
import "antd/dist/antd.css";

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
    const { Content, Footer } = Layout;
    const { auth } = this.props;
    return (
      <Layout className="layout">
        <Header/>
        <Content style={{ padding: '0 50px' }}>
          {
            auth.values.isLoggedIn ? <RenderingPage/> : <LoginPage/>
          }
        </Content>
      </Layout>
    );
  }
}

export default App;