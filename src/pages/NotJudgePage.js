import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Row, Col } from 'antd';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

@inject('contract', 'auth')
@observer
class NotJudgePage extends Component {
  state = {
    iconLoading: false
  };

  applyReferee = async () => {
    this.setState({
      iconLoading: true
    })
    const address = this.props.auth.values.address;
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.applyReferee().estimateGas({ 
        from: address, 
      });
    
      contract.methods.applyReferee().send({ 
        from: this.props.auth.values.address,
        gas: gasAmount
      }).on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        console.log(receipt);
        this.props.auth.openPage(1);
        this.props.auth.openPage(2);
      })
      .on('error', err => {
        alert(err.message);
        this.setState({
          iconLoading: false
        });
      });
    } catch (e) {
      alert(e.message);
      this.setState({
        iconLoading: false
      });
      return;
    }
  }

  render() {
    return (
      <div style={{backgroundColor: "#ffffff"}} >
        <div style={{backgroundColor: "#ffffff", height: "617px", borderBottom: "solid 1px #979797" }}>
          <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center", paddingTop: "200px"}}>
            <h2 style={{color: "#979797", fontSize: "30px", fontWeight: "lighter"}}>
              심사위원이 되고 Judge를 해보세요!
            </h2>
            <Button 
              onClick={this.applyReferee} 
              style={{ 
                maxWidth: "412px", minWidth: "300px", width: "90%", color: "#979797", 
                fontSize: "30px", marginTop: "140px", height: "98px", fontWeight: "lighter" 
              }}
              loading={this.state.iconLoading}
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
