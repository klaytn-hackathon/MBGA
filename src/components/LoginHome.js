import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';

@inject('auth', 'contract')
@observer
class LoginHome extends Component {
  state = { visible: false, privateKey: "", showPassword: true };

  clickStart = () => {
    const { isLoggedIn } = this.props.auth.values;
    if(isLoggedIn) {
      // this.props.auth.reset();
      // this.props.contract.resetMine();
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
      <div style={{backgroundColor: "#2f54eb", height: "620px", justifyContent: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center", paddingTop: "300px"}}>
          <h2 style={{color: "#ffffff", fontWeight: "lighter"}}>
            당신의 삶을 다시 한번 Build-up 해보세요.
          </h2>
          <Button 
            shape="round" 
            onClick={this.clickStart} 
            style={{ 
              maxWidth: "412px", minWidth: "300px", width: "90%", color: "#2f54eb", 
              fontSize: "16px", marginTop: "90px", height: "48px" 
            }}
          >
            시작하기
          </Button>
        </div>
        <Modal
          title="Login with Private Key"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="Sign In"
          cancelText="Close"
        >
          <Input 
            id="outlined-uncontrolled"
            placeholder="0x2c4078447..."
            name="privateKey"
            type={this.state.showPassword ? 'text' : 'password'}
            value={this.state.privateKey}
            margin="normal"
            variant="outlined"
            onChange={this.handleChange('privateKey')}
          />
          {
            errors != void 0 ?  
              <div style={{color: "red"}}>{errors.message}</div> : ""
          }
        </Modal>
      </div>
    );
  }
}

export default LoginHome;
