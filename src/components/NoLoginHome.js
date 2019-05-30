import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';
import mainLogoImage from '../static/main_logo.png';

@inject('auth', 'contract')
@observer
class NoLoginHome extends Component {
  state = { visible: false, privateKey: "", showPassword: true };

  clickStart = () => {
    const { isLoggedIn } = this.props.auth.values;
    if(isLoggedIn) {
      this.props.auth.openPage("4");
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
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center", paddingTop: "30px"}}>
          <div style={{ marginBottom: "80px" }}>
            <img src={mainLogoImage} alt="" />
          </div>
          <div style={{color: "#ffffff", fontSize: "24px"}}>
            Build Up & Success YOUR CHALLENGE
          </div>
          <Button 
            shape="round" 
            onClick={this.clickStart} 
            style={{ 
              maxWidth: "412px", minWidth: "300px", width: "90%", color: "#2f54eb", 
              fontSize: "16px", marginTop: "30px", height: "48px", fontWeight: "lighter"
            }}
          >
            NOW START
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

export default NoLoginHome;
