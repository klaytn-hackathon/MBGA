import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Layout } from 'antd';
import Header from './components/Header';
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
    const { Content } = Layout;
    return (
      <Layout className="layout" >
        <Header />
        <Content style={{ padding: '0', overflow: 'auto', height: "calc(100vh - 64px)", backgroundColor: "white" }} >
          <RenderingPage />
        </Content>
      </Layout>
    );
  }
}

export default App;