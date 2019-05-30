import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Row, Col } from 'antd';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import footerBackgroundImage1 from '../static/judge.png';
import footerBackgroundImage2 from '../static/Judge2.png';

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
        this.props.auth.openPage("1");
        this.props.auth.openPage("2");
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
        <div style={{backgroundColor: "#ffffff", height: "617px" }}>
          <div 
            style={{ 
              justifyContent: "center", alignItems: "center", display: "block",
              backgroundImage: `url(${footerBackgroundImage1})`, backgroundSize: "cover", backgroundPosition: "center",
              textAlign: "center", height: "688px"
            }}
          >
            <h2 style={{color: "#343434", fontSize: "24px", paddingTop: "230px", fontStyle: "italic" }}>
              Be a judge and get reward!
            </h2>
            <Button 
              onClick={this.applyReferee} 
              style={{ 
                maxWidth: "412px", minWidth: "360px", width: "30%", 
                marginTop: "140px", fontWeight: "lighter", backgroundColor: "#2f54eb", borderColor: "#2f54eb"
              }}
              loading={this.state.iconLoading}
              type="primary"
              shape="round"
              size="large"
            >
              Become a judge
            </Button>
          </div>
        </div>
        <div 
          style={{
            backgroundColor: "#ffffff", height: "826px", borderBottom: "solid 1px #979797", 
            alignItems: "center",
            backgroundImage: `url(${footerBackgroundImage2})`, backgroundSize: "auto 826px", backgroundRepeat: "no-repeat"
          }}
        >
          <div style={{
            width: "58%", minWidth: "300px", backgroundColor: "#D9E5FF", opacity: "0.6",
            height: "100%", float: "right"
          }}>
            <h2 style={{color: "black", fontSize: "18px", marginLeft: "175px", marginTop: "264px", opacity: "1.0"}}>
              If you check someone else's proof,<br/> 
              You can get KLAY as a reward.
            </h2>
            <h2 style={{color: "black", fontSize: "12px", marginLeft: "175px", marginTop: "120px", opacity: "1.0" }}>
              If you become a judge,<br/>
              The project is randomly assigned.<br/> 
              <br/>
              If you validate an assigned project, you will be rewarded at the end of the project.
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

export default NotJudgePage;
