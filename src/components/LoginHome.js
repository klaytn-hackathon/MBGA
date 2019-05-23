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
          items.push({ info, status, key: projectList[i] });
          if(items.length >= 2) break;
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
        if(items.length >= 2) break;
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
    this.props.auth.openPage("3");
  }

  render() {
    const { errors, values } = this.props.auth;
    if(this.state.loading) {
      return <div style={{textAlign: "center"}}>Loading...</div>
    }
    if(this.state.items.length === 0) {
      return <NoLoginHome />;
    }
    return (
      <div style={{ justifyContent: "center",  display: "block" }}>
        <div style={{ justifyContent: "center", alignItems: "center", height: "170px", display: "flex" }}>
          <div style={{ textAlign: "center", fontSize: "30px", fontWeight: "lighter"}}>MyLife</div>
        </div>
        {
          this.state.items.map((item) => {
            return (
              <div key={item.key} style={{ height: "232px", borderTop: "1px solid #979797", borderBottom: "1px solid #979797", marginBottom: "22px"}}>
                <Row type="flex" align="middle" justify="center" style={{ height: "100%" }}>
                  <Col span={12} style={{ maxWidth: "1400px", minWidth: "375px", alignItems: "center", display: "flex" }}>
                    <div style={{ float: "left", alignItems: "center" }}>
                      <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434"}}> 
                        {item.info.name}
                      </div>
                      <TimerComponent endDate={item.info.endDate} style={{ fontSize: "18px", fontWeight: "lighter", color: "#979797", marginTop: "42px"}} />
                    </div>
                  </Col>
                  <Col span={6} style={{alignItems: "center", display: "flex", justifyContent: "flex-end"}}>
                    <ProofSubmitStatus info={item.info} status={item.status} projectNo={item.key} />
                  </Col>
                </Row>
              </div>
            );
          })
        }
        
        <div style={{ justifyContent: "center", alignItems: "center", textAlign: "center", marginTop: "20px", fontSize: "30px", fontWeight: "lighter", textDecoration: "underline"}}>
          <Button 
            type="link" 
            ghost
            style={{marginTop: "20px", fontSize: "30px", fontWeight: "lighter", color:"#343434"}}
            onClick={this.createNewProject}
          >
            <div style={{borderBottom: "1px solid #343434"}}>새로운 도전하기</div>
            
          </Button>
        </div>
      </div>
    );
  }
}

export default LoginHome;
