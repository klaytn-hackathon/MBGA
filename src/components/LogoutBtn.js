import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';

@inject('auth', 'contract')
@observer
class LogoutBtn extends Component {
  state = { visible: false, privateKey: "", showPassword: true };

  onLogoutBtnClick = () => {
    const { isLoggedIn } = this.props.auth.values;
    if(isLoggedIn) {
      this.props.auth.reset();
      this.props.contract.resetMine();
    } else {
      this.showModal();
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = async e => {
    console.log(e);
    await this.props.auth.login(this.state.privateKey);
    if(this.props.auth.errors === void 0) {
      this.setState({
        visible: false,
      });
    }
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { errors, values } = this.props.auth;
    const { isLoggedIn } = values;
    return (
      <div className="Logout">
        <Button
          shape="round"
          onClick={this.onLogoutBtnClick}
          size="small"
          ghost
        >
          { 
            isLoggedIn ? "sign out" : "sign in"
          }
        </Button>
        <Modal
          title="Login with Private Key"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="Sign In"
          cancelText="Close"
        >
          <Input.Password 
            id="outlined-uncontrolled"
            placeholder="0x2c4078447..."
            name="privateKey"
            type={this.state.showPassword ? 'text' : 'password'}
            value={this.state.privateKey}
            margin="normal"
            variant="outlined"
            onChange={this.handleChange('privateKey')}
          />
          <a href="https://baobab.klaytnwallet.com/">
            klaytn 지갑 만들러 가기(test_klay 받으러 가기)
          </a>
          {
            errors != void 0 ?  
              <div style={{color: "red"}}>{errors.message}</div> : ""
          }
        </Modal>
      </div>
    );
  }
}

export default LogoutBtn;