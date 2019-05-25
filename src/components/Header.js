import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Layout, Menu } from 'antd';
import LogoutBtn from './LogoutBtn';
import logo from '../static/logo.png';

const styles = {
  openTab: {
    color: "#ffffff", 
    fontWeight: "bold",
  }
};

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
      <Header style={{backgroundColor: "#2f54eb", padding: "0px 30px"}}>
          <div style={{float: "left"}}>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[]}
              style={{ lineHeight: '64px', fontColor: "#ffffff", backgroundColor: "#2f54eb" }}
              onClick={this.handleChange}
            >
              <Menu.Item key="1">
                home
              </Menu.Item>
              <Menu.Item key="2">
                {
                  page === "2" ? <div style={styles.openTab}>judge</div> : "judge"
                }
              </Menu.Item>
              <Menu.Item key="3">
                {
                  page === "3" ? <div style={styles.openTab}>my</div> : "my"
                }
              </Menu.Item>
            </Menu>
          </div>
          <div style={{position: "absolute", top: "0px", right: "30px"}}>
            <LogoutBtn />
          </div>
      </Header>
    );
  };
};

export default Header;