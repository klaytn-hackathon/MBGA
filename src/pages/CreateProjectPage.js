import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';

@inject('contract', 'auth')
@observer
class CreateProjectPage extends Component {
  state = { name: "" };

  componentDidMount() {
    this.props.contract.reset();
  }
  
  clickNext = () => {
    this.props.contract.setProjectName(this.state.name);
    this.props.auth.openPage("5");
  }
  
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  } 

  render() {
    return (
      <div style={{backgroundColor: "#ffffff", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center" }}>
          <div style={{color: "#343434", fontSize: "18px", fontWeight: "lighter"}}>
            What is Your Challenge?
          </div>
          <div style={{color: "#343434", fontSize: "12px", fontWeight: "lighter", marginTop: "44px"}}>
            Please write down your goals.
          </div>
          <div>
            <Input
              name="name"
              value={this.state.name}
              type="dashed"
              style={{ 
                maxWidth: "412px", minWidth: "375px", width: "30%",
                marginTop: "74px", height: "40px", fontWeight: "lighter" 
              }}
              placeholder="Input your challenge"
              onChange={this.handleChange('name')}
            />
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

export default CreateProjectPage;
