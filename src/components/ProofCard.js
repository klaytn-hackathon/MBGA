import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Button } from 'antd';
import RemainTimer from './RemainTimer';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

@inject('auth')
@observer
class ProofCard extends Component {
  state = { project: null, isReferee: false, };

  async componentDidUpdate(prevProps) {
    if(this.props.proof !== prevProps.proof) {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const project = await contract.methods.getProjectInfo(this.props.proof.projectNo).call();
      const referees = await contract.methods.getProjectReferees(this.props.proof.projectNo).call();
      const myAddr = this.props.auth.values.address;
      if(myAddr === referees[0] || myAddr === referees[1] || myAddr === referees[2]) {
        this.setState({
          project, isReferee: true,
        });
      } else {
        this.setState({
          project, isReferee: false,
        });
      }
    }
  }

  render() {
    const { handleOk, handleCancel, visible, proof, disable, loading } = this.props;
    let disable2 = disable;
    if(disable2 == void 0) disable2 = false;
    if(proof == void 0) {
      return <div></div>;
    }
    let loading2 = loading;
    if(loading2 == void 0) loading2 = false;
    return (
      <Modal
        title={ <div style={{ justifyContent: "center", alignItems: "center" }}>
          <RemainTimer timestamp={proof.timestamp} style={{ fontSize: "30px", fontWeight: "lighter", textAlign: "center" }}/> 
        </div>}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Button key="back" onClick={handleCancel} style={{ width: "49%"}} 
              disabled={disable2} loading={loading2} type="danger"
            >
              { this.state.isReferee ? "decline" : "dislike" }
            </Button>
            <Button key="submit" type="primary" loading={loading2} onClick={handleOk} 
              style={{ width: "49%"}} disabled={disable2}
            >
              { this.state.isReferee ? "accept" : "like" }
            </Button>
          </div>
        }
      >
        <img
          src={JSON.parse(proof.memo).i}
          style={{ width: "100%" }}
        />
        <h3 style={{ margin: "8px 0px 4px" }}>Project Title</h3>
        <div>{this.state.project != void 0 ? this.state.project.name : "loading..."}</div>
        <h3 style={{ margin: "8px 0px 4px" }}>Proof Title</h3>
        <div>{this.props.proof.name}</div>
        <h3 style={{ margin: "8px 0px 4px" }}>Timestamp</h3>
        <div>{new Date(this.props.proof.timestamp * 1000).toLocaleString()}</div>
      </Modal>
    );
  }
}

export default ProofCard;