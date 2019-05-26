import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, DatePicker } from 'antd';
import moment from 'moment';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

@inject('contract', 'auth')
@observer
class InputDatePage extends Component {
  state = { date: "", visible: false, loading: false, };
  
  componentDidMount() {
    const date = new Date(new Date().getTime() + 24 * 3600 * 1000 * 7);
    const defaultDate = moment(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, "YYYY-MM-DD");
    this.setState({
      date: defaultDate
    });
  }

  clickNext = async () => {
    const date = new Date(new Date().getTime() + 24 * 3600 * 1000);
    const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endTimeObj = this.state.date.toObject();
    const endTime = new Date(new Date(endTimeObj.years, endTimeObj.months, endTimeObj.date).getTime() + 3600 * 1000 * 24);
    await this.props.contract.setPeriod(tomorrow.getTime() / 1000, endTime.getTime() / 1000);
    await this.setState({
      visible: true
    });
  }
  
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  } 

  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
  }

  handleOk = async e => {
    this.setState({ loading: true });
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.createProject(this.props.contract.projectName,
        "",
        this.props.contract.startTime,
        this.props.contract.endTime
      ).estimateGas({ 
        from: this.props.auth.values.address, 
        value: cav.utils.toPeb(this.props.contract.betAmount),
      });
    
      contract.methods.createProject(this.props.contract.projectName,
        "",
        this.props.contract.startTime,
        this.props.contract.endTime
      ).send({ 
        from: this.props.auth.values.address, 
        value: cav.utils.toPeb(this.props.contract.betAmount),
        gas: gasAmount
      }).on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        console.log(receipt);
        this.setState({
          visible: false,
          loading: false,
        });
        this.props.auth.openPage("1");
      })
      .on('error', err => {
        alert(err.message);
        this.setState({
          visible: false,
          loading: false,
        });
      });
    } catch (e) {
      return;
    }
  }

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  }

  render() {
    return (
      <div style={{backgroundColor: "#ffffff", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center" }}>
          <h2 style={{color: "#979797", fontSize: "24px", fontWeight: "lighter"}}>
            언제까지 도전하시겠습니까?
          </h2>
          <h3 style={{color: "#979797", fontSize: "17px", fontWeight: "lighter"}}>
            내일부터 하루에 한번 인증해야 합니다.
          </h3>
          <div>
            <DatePicker 
              style={{ marginRight: "30px", marginTop: "140px"}}
              placeholder="select end date"
              size="large"
              format={"YYYY-MM-DD"}
              disabledDate={this.disabledDate}
              value={this.state.date}
              onChange={value => this.setState({'date': value})}
            />
           일까지
          </div>
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
        <Modal
          title="Sign Transaction"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel} style={{ width: "48%", marginRight: "4%"}}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleOk} loading={this.state.loading} style={{ width: "48%", margin: "0px"}}>
              Submit
            </Button>,
          ]}
        >
          <div>{this.props.contract.projectName}</div>
          <div>{this.props.contract.betAmount} KLAY</div>
          <div>{new Date(this.props.contract.startTime * 1000).toDateString()}</div>
          <div>{new Date(this.props.contract.endTime * 1000 - 3600000 * 24).toDateString()}</div>
        </Modal>
      </div>
    );
  }
}

export default InputDatePage;
