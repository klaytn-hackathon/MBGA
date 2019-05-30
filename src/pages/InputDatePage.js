import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, DatePicker } from 'antd';
import moment from 'moment';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

@inject('contract', 'auth')
@observer
class InputDatePage extends Component {
  state = { date: null, visible: false, loading: false, };
  
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
    console.log(1)
    this.setState({
      visible: false,
    });
  }

  render() {
    return (
      <div style={{backgroundColor: "#ffffff", height: "100%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ justifyContent: "center", alignItems: "center", display: "block", textAlign: "center" }}>
          <div style={{color: "#343434", fontSize: "18px", fontWeight: "lighter"}}>
            From tomorrow until when?
          </div>
          <div style={{color: "#343434", fontSize: "12px", fontWeight: "lighter", marginTop: "44px"}}>
            You have to authenticate it once a day.
          </div>
          <div>
            <DatePicker 
              style={{ marginTop: "74px", width: "224px"}}
              placeholder="select end date"
              size="large"
              format={"YYYY-MM-DD"}
              disabledDate={this.disabledDate}
              value={this.state.date}
              onChange={value => this.setState({'date': value})}
            />
          </div>
          <div>
            <Button 
              onClick={this.clickNext} 
              style={{ 
                maxWidth: "412px", minWidth: "375px", width: "30%", marginTop: "125px", 
                backgroundColor: "#2f54eb", borderColor: "#2f54eb",
                fontWeight: "bold"
              }}
              type="primary" shape="round"
              size="large"
            >
              START IT!
            </Button>
          </div>
        </div>
        <Modal
          title="Sign Transaction"
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <Button key="back" onClick={this.handleCancel} style={{ width: "49%"}}
              >
                Cancel
              </Button>
              <Button key="submit" type="primary" loading={this.state.loading} onClick={this.handleOk} 
                style={{ width: "49%"}}
              >
                Submit
              </Button>
            </div>
          }
        >
          <div><b>Project Title : </b>{this.props.contract.projectName}</div>
          <div><b>Project Value : </b>{this.props.contract.betAmount} KLAY</div>
          <div><b>Start Date : </b>{new Date(this.props.contract.startTime * 1000).toDateString()} 00:00:00</div>
          <div><b>End Date : </b>{new Date(this.props.contract.endTime * 1000 - 3600000 * 24).toDateString()} 23:59:59</div>
        </Modal>
      </div>
    );
  }
}

export default InputDatePage;
