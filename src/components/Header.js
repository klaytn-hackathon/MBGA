import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Layout, Menu } from 'antd';
import LogoutBtn from './LogoutBtn';
import logo from '../static/logo.png';

@inject('auth')
@observer
class Header extends Component {

  handleChange = e => {
    this.props.auth.openPage(e.key);
  };

  render() {
    const { Header } = Layout;
    const { page } = this.props.auth.values;
    return (
      <Header style={{backgroundColor: "#2f54eb"}}>
          <div style={{float: "left"}}>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={[page]}
              style={{ lineHeight: '64px', fontColor: "#ffffff", backgroundColor: "#2f54eb" }}
              onClick={this.handleChange}
            >
              <Menu.Item key="1">home</Menu.Item>
              <Menu.Item key="2">judge</Menu.Item>
              <Menu.Item key="3">explore</Menu.Item>
            </Menu>
          </div>
          <div style={{float: "right"}}>
            <LogoutBtn />
          </div>
      </Header>
    );
  };
};

export default Header;