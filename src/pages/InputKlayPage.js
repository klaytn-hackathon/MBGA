import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';
import cav from '../klaytn/caver';

@inject('contract', 'auth')
@observer
class InputKlayPage extends Component {
  state = { value: "", currentKlay: 0 };
  
  componentDidMount() {
    cav.klay.getBalance(this.props.auth.values.address).then(value => {
      this.setState({ currentKlay: cav.utils.fromPeb(value)});
    })      
  }

  clickNext = () => {
    const value = this.state.value * 1;
    if(value > 0 && value <= this.state.currentKlay * 1) {
      this.props.contract.setBetAmount(value);
      this.props.auth.openPage("5");
    } else {
      alert("Bet amount cannot be over klay amout of address.");
    }
  }
  
  handleChange = name => event => {
    const value = event.target.value * 1;
    if(!isNaN(value)) {
      this.setState({
        [name]: event.target.value,
      });
    }
  } 

  render() {
    return (
      <div style={{backgroundColor: "#ffffff", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center" }}>
          <h2 style={{color: "#979797", fontSize: "24px", fontWeight: "lighter"}}>
            담보 금액은 얼마입니까?
          </h2>
          <div>
          <Input
            name="name"
            value={this.state.value}
            type="dashed"
            style={{ 
              maxWidth: "692px", minWidth: "375px", width: "60%", color: "#979797", 
              fontSize: "30px", marginTop: "140px", height: "88px", fontWeight: "lighter", marginRight: "4px" 
            }}
            placeholder="0"
            onChange={this.handleChange('value')}
          >
          </Input>
           KLAY
          </div>
          <div style={{ textAlign: "right", marginTop: "13px", 
            fontSize: "24px", fontWeight: "lighter", color: "#979797" }}>
            나의 KLAY: {Math.floor(this.state.currentKlay * 100) / 100}
          </div>
          <Button 
            onClick={this.clickNext} 
            style={{ 
              maxWidth: "525px", minWidth: "375px", width: "55%", color: "#979797", 
              fontSize: "30px", marginTop: "140px", height: "98px", fontWeight: "lighter" 
            }}
          >
            다음 단계로
          </Button>
        </div>
      </div>
    );
  }
}

export default InputKlayPage;
