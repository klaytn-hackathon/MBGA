import React, { Component } from "react";
import { Button, Modal, Input } from 'antd';

class CreateProjectPage extends Component {

  render() {
    return (
      <div style={{backgroundColor: "#ffffff", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center", paddingTop: "200px"}}>
          <h2 style={{color: "#979797", fontSize: "24px", fontWeight: "lighter"}}>
            {this.props.text}
          </h2>
          <Input
            type="dashed"
            style={{ 
              maxWidth: "692px", minWidth: "375px", width: "60%", color: "#979797", 
              fontSize: "30px", marginTop: "140px", height: "88px", fontWeight: "lighter" 
            }}
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
