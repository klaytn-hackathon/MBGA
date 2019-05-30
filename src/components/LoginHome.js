import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Row, Col } from 'antd';
import NoLoginHome from './NoLoginHome';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import TimerComponent from './TimerComponent';
import ProofSubmitStatus from './ProofSubmitStatus';

@inject('auth')
@observer
class LoginHome extends Component {
  loadCount = 0;
  state = { loading: true, items: [] };

  async componentDidUpdate(prevProps) { 
    if(this.props.auth.values.address !== prevProps.auth.values.address) {
      try {
        const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
        console.log(this.props.auth.values.address)
        const projectList = await contract.methods.getMyProjectList(this.props.auth.values.address).call();
        const items = [];
        for(let i = projectList.length - 1; i >= 0; i -= 1) {
          const info = await contract.methods.getProjectInfo(projectList[i] * 1).call();
          const status = await contract.methods.getProjectStatus(projectList[i] * 1).call();
          const proofList = await contract.methods.getProofList(projectList[i] * 1).call();
          let timestamp = 0;
          if(proofList.length !== 0) {
            const proof = await contract.methods.getProof(proofList[proofList.length - 1]).call();
            timestamp = proof.timestamp;
          }
          items.push({ info, status, key: projectList[i], timestamp });
          if(items.length >= 3 && this.props.fromPage !== "my") break;
        }
        this.setState({
          loading: false,
          items
        });
      } catch(e) {
        this.setState({
          loading: false,
          items: [],
        })
      }
    }
  }

  async componentDidMount() {
    const address = this.props.auth.values.address || JSON.parse(sessionStorage.getItem('walletInstance')).address;

    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      console.log(address)
      const projectList = await contract.methods.getMyProjectList(address).call();
      const items = [];
      for(let i = projectList.length - 1; i >= 0; i -= 1) {
        const info = await contract.methods.getProjectInfo(projectList[i] * 1).call();
        const status = await contract.methods.getProjectStatus(projectList[i] * 1).call();
        items.push({ info, status, key: projectList[i] });
        if(items.length >= 3 && this.props.fromPage !== "my") break;
      }
      this.setState({
        loading: false,
        items
      });
    } catch(e) {
      this.setState({
        loading: false,
        items: [],
      })
    }
  }

  createNewProject = () => {
    this.props.auth.openPage("4");
  }

  render() {
    const { errors, values } = this.props.auth;
    if(this.state.loading) {
      return <div style={{textAlign: "center"}}>Loading...</div>
    }
    if(this.state.items.length === 0 && this.props.fromPage !== "my") {
      return <NoLoginHome />;
    }
    return (
      <div style={{ justifyContent: "center",  display: "block" }}>
        <div style={{ marginTop: "80px", width: "100%", textAlign: "center" }}>
          <div style={{ textAlign: "center", marginTop: "100px", fontStyle: "italic", color: "#343434", fontSize: "24px", opacity: 0.8 }}>MY Challenge</div>
          <div style={{ width: "89px", height: "4px", backgroundColor: "#2f54eb", margin: "20px auto 50px", borderRadius: "2px" }}></div>
        </div>
        {
          this.state.items.length > 0 ? this.state.items.map((item) => {
            return (
              <div key={item.key} style={{ height: "180px", marginBottom: "22px", boxShadow: "0 0 8px 3px rgba(217, 217, 217, 0.5)", marginRight: "10%", marginLeft: "10%"}}>
                <Row type="flex" align="middle" justify="center" style={{ height: "100%" }}>
                  <Col span={12} style={{ maxWidth: "1400px", minWidth: "375px", alignItems: "center", display: "flex" }}>
                    <div style={{ float: "left", alignItems: "center" }}>
                      <div style={{ fontWeight: "lighter", color: "#343434", fontSize: "18px"}}> 
                        {item.info.name}
                      </div>
                      <TimerComponent endDate={item.info.endDate} style={{ fontSize: "12px", fontWeight: "lighter", color: "#979797", marginTop: "42px"}} />
                    </div>
                  </Col>
                  <Col span={6} style={{alignItems: "center", display: "flex", justifyContent: "flex-end"}}>
                    <ProofSubmitStatus info={item.info} status={item.status} projectNo={item.key} timestamp={item.timestamp} />
                  </Col>
                </Row>
              </div>
            );
          }) : <div>
            No Data.
          </div>
        }
        
        <div style={{ justifyContent: "center", alignItems: "center", textAlign: "center", marginTop: "20px", fontSize: "30px", fontWeight: "lighter", textDecoration: "underline"}}>
          <Button 
            type="link" 
            ghost
            style={{marginTop: "20px", fontSize: "30px", fontWeight: "lighter", color:"#343434"}}
            onClick={this.createNewProject}
          >
            <div style={{ borderBottom: "1px solid #343434", fontSize: "12px", color: "#343434" }}>New Challenge</div>
            
          </Button>
        </div>
      </div>
    );
  }
}

export default LoginHome;
