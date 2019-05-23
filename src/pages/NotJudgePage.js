import React, { Component } from "react";
import { Button, Modal, Input, Row, Col } from 'antd';

class NotJudgePage extends Component {

  render() {
    return (
      <div style={{backgroundColor: "#ffffff"}} >
        <div style={{backgroundColor: "#ffffff", height: "617px", borderBottom: "solid 1px #979797" }}>
          <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center", paddingTop: "200px"}}>
            <h2 style={{color: "#979797", fontSize: "30px", fontWeight: "lighter"}}>
              심사위원이 되고 Judge를 해보세요!
            </h2>
            <Button 
              onClick={this.clickStart} 
              style={{ 
                maxWidth: "412px", minWidth: "300px", width: "90%", color: "#979797", 
                fontSize: "30px", marginTop: "140px", height: "98px", fontWeight: "lighter" 
              }}
            >
              심사위원이 되기
            </Button>
          </div>
        </div>
        <div style={{backgroundColor: "#ffffff", height: "617px", borderBottom: "solid 1px #979797", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ jdisplay: "block", textAlign: "center", width: "100%" }}>
            <h2 style={{color: "#979797", fontSize: "30px", fontWeight: "lighter", width: "100%"}}>
              다른 사람의 기록을 인증하는 인증 판사가 되세요!
            </h2>
            <h2 style={{color: "#979797", fontSize: "30px", fontWeight: "lighter", marginTop: "200px", width: "100%"}}>
              인증하고 나면 KLAY를 얻을 수 있습니다.
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

export default NotJudgePage;
