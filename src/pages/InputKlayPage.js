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
      this.props.auth.openPage("6");
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
          <div style={{color: "#343434", fontSize: "18px", fontWeight: "lighter"}}>
            How much would you like to pay for collateral KLAY?
          </div>
          <div style={{color: "#343434", fontSize: "12px", fontWeight: "lighter", marginTop: "44px"}}>
            After successfully exiting the challenge, it is returned.
          </div>
          <div>
            <Input
              name="name"
              value={this.state.value}
              type="dashed"
              style={{ 
                maxWidth: "412px", minWidth: "375px", width: "30%", 
                marginTop: "74px", height: "40px", fontWeight: "lighter" 
              }}
              placeholder="Input your collateral KLAY"
              onChange={this.handleChange('value')}
            />
          </div>
          <div style={{ textAlign: "right", marginTop: "14px",
            maxWidth: "412px", minWidth: "375px", width: "30%",
            fontSize: "12px", fontWeight: "lighter", color: "#343434" }}>
            My KLAY: {Math.floor(this.state.currentKlay * 100) / 100}
          </div>
          <div>
            <Button 
              onClick={this.clickNext} 
              style={{ 
                maxWidth: "412px", minWidth: "375px", width: "30%", marginTop: "74px", 
                backgroundColor: "#2f54eb", borderColor: "#2f54eb",
                fontWeight: "bold"
              }}
              type="primary" shape="round"
              size="large"
            >
              NEXT
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default InputKlayPage;
