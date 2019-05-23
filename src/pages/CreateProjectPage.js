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
    this.props.auth.openPage("4");
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
          <h2 style={{color: "#979797", fontSize: "24px", fontWeight: "lighter"}}>
            당신의 목표는 무엇인가요?
          </h2>
          <Input
            name="name"
            value={this.state.name}
            type="dashed"
            style={{ 
              maxWidth: "692px", minWidth: "375px", width: "60%", color: "#979797", 
              fontSize: "30px", marginTop: "140px", height: "88px", fontWeight: "lighter" 
            }}
            onChange={this.handleChange('name')}
          >
          </Input>
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

export default CreateProjectPage;
