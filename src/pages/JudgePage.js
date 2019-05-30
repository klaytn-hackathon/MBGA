import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NotJudgePage from './NotJudgePage';
import ProofCard from '../components/ProofCard';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import RemainTimer from '../components/RemainTimer';

@inject('auth')
@observer
class JudgePage extends Component {
  state = {
    loading: true,
    judgeItems: [],
    finishedItems: [],
    isReferee: true,
    visible: true,
    selectedItem: null,
    disable: false,
  };
  itemList = [];
  overTime = false;
  project = {};

  fetchMoreData = async () => {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const newJudgeItems = [];
    const newFinishedItems = [];
    const address = this.props.auth.values.address;
    const judgeLength = this.state.judgeItems.length;
    const finishedLength = this.state.finishedItems.length;
    for (let i = this.itemList.length - 1 - judgeLength - finishedLength; i >= 0; i -= 1) {
      const item = await contract.methods.getProof(this.itemList[i] * 1).call();
      item.proofNo = this.itemList[i];
      if(!this.project.hasOwnProperty(item.projectNo)) {
        const info = await contract.methods.getProjectInfo(item.projectNo).call();
        this.project[item.projectNo] = { title: info.name };
      }

      if (!this.overTime) {
        const current = new Date().getTime();
        if (current < item.timestamp * 1000 + 2 * 24 * 3600 * 1000) {
          if(item.like.includes(address) || item.dislike.includes(address)) {
            newFinishedItems.push(item);
          } else {
            newJudgeItems.push(item);
          }
        } else {
          this.overTime = true;
          newFinishedItems.push(item);
        }
      } else {
        newFinishedItems.push(item);
      }
      if (this.overTime && newFinishedItems.length >= 6) {
        break;
      }
    }

    this.setState({
      judgeItems: this.state.judgeItems.concat(newJudgeItems),
      finishedItems: this.state.finishedItems.concat(newFinishedItems),
      loading: false,
    }, () => {
      if (newFinishedItems.length !== 0 || newJudgeItems.length !== 0) {
        window.addEventListener("scroll", this.infiniteScroll, true);
      }
    });
  };
  
  infiniteScroll = async () => {
    const scrollHeight = document.querySelector("main").scrollHeight
    const scrollTop = document.querySelector("main").scrollTop;
    const clientHeight = document.querySelector("main").clientHeight;

    if(scrollTop + clientHeight === scrollHeight) {
      window.removeEventListener("scroll", this.infiniteScroll, true);
      this.fetchMoreData();
    }
  }

  onClickButton = (item, disable) => {
    this.setState({
      visible: true,
      disable,
      selectedItem: item,
    })
  }

  async componentDidMount() {
    const address = this.props.auth.values.address;
    if(address == void 0 || address.length === 0) {
      alert("use after sign in");
      this.props.auth.openPage("1");
    }
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const refereeList = await contract.methods.getWhiteList().call();
    
    if(refereeList.includes(this.props.auth.values.address)) {
      const itemList = await contract.methods.getJudgeList(address).call();
      this.itemList = itemList;
      this.fetchMoreData();
    } else {
      this.setState({
        loading: false,
        isReferee: false,
      });
    }
  }

  handleOk = async e => {
    const like = this.state.selectedItem.like;
    const dislike = this.state.selectedItem.dislike;
    const address = this.props.auth.values.address;
    if(like.includes(address) || dislike.includes(address)) {
      alert("you already voted!");
      return;
    }
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.likeProof(this.state.selectedItem.proofNo).estimateGas({ 
        from: address
      });
      contract.methods.likeProof(this.state.selectedItem.proofNo).send({ 
        from: address,
        gas: gasAmount
      }).on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        console.log(receipt);
        this.setState({
          visible: false,
        });
        this.props.auth.openPage("1");
        this.props.auth.openPage("2");
      })
      .on('error', err => {
        alert(err.message);
        this.setState({
          visible: false,
        });
      });
    } catch (e) {
      return;
    }
  }

  handleCancel = async e => {
    if(e.target.className === "ant-btn ant-btn-danger") {
      const like = this.state.selectedItem.like;
      const dislike = this.state.selectedItem.dislike;
      const address = this.props.auth.values.address;
      if(like.includes(address) || dislike.includes(address)) {
        alert("you already voted!");
        return;
      }
      try {
        const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
        const gasAmount = await contract.methods.dislikeProof(this.state.selectedItem.proofNo).estimateGas({ 
          from: this.props.auth.values.address
        });
        contract.methods.dislikeProof(this.state.selectedItem.proofNo).send({ 
          from: this.props.auth.values.address,
          gas: gasAmount
        }).on('transactionHash', (hash) => {
          console.log(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt);
          this.setState({
            visible: false,
          });
          this.props.auth.openPage("1");
          this.props.auth.openPage("2");
        })
        .on('error', err => {
          alert(err.message);
          this.setState({
            visible: false,
          });
        });
      } catch (e) {
        alert(e.message);
        this.setState({
          visible: false,
        });
        return;
      }
    } else {
      this.setState({
        visible: false,
      });
      return;
    }
  }

  handleTime = timestamp => {
    const startDate = new Date(timestamp * 1000);
    return `${startDate.getFullYear()}. ${startDate.getMonth() + 1}. ${startDate.getDate()}`;
  }

  cancelReferee = async () => {
    const address = this.props.auth.values.address;
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.cancelReferee().estimateGas({ 
        from: address, 
      });
    
      contract.methods.cancelReferee().send({ 
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
      });
    } catch (e) {
      return;
    }
  }

  render() {
    if(this.state.loading) {
      return <div>Loading...</div>;
    }
    if(!this.state.isReferee) {
      return <NotJudgePage />;
    }
    const { Meta } = Card;
    const { isLoggedIn, address } = this.props.auth.values;
    return (
      <div style={{backgroundColor: "#ffffff", marginTop: "70px"}} >
        <div style={{ justifyContent: "center", display: "flex"}} >
          <div
            style={{ 
              maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "75%", 
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "left", fontSize: "30px", fontWeight: "lighter" }}>
                My Judge
            </div>
            <Button 
              size="large"
              style={{ width: "215px" }}
              onClick={this.cancelReferee}
            >
              Cancel Judges
            </Button>
          </div>
        </div>
        <div
          style={{ maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "75%", justifyContent: "center" }}
        >
          <h2 style={{ textAlign: "center", marginTop: "100px", fontStyle: "italic", color: "#343434", opacity: 0.8 }}>
            Check Proof
          </h2>
          <div style={{ width: "89px", height: "4px", backgroundColor: "#5c5c5d", margin: "20px auto 130px", borderRadius: "2px" }}></div>
        </div>
        <div
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "auto", 
          width: "90%", justifyContent: "flex-start", listStyle: "none", flexWrap: "wrap", 
          padding: "0", }}
        >
          {
            this.state.judgeItems.length > 0 ? this.state.judgeItems.map((item, index) => (
              <Card
                style={{ width: "275px", height: "275px", margin: "20px", boxShadow: "0 0 8px 3px rgba(217, 217, 217, 0.5)" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              > 
                <div style={{ position: "absolute", top: "5%", color: "white", textShadow: "2px 2px 2px black" }}>
                  { this.project[item.projectNo].title }
                </div>
                <RemainTimer
                  style={{ position: "absolute", top: "87.8%", color: "white", textShadow: "2px 2px 2px black", fontSize: "12px" }}
                  timestamp={item.timestamp * 1}
                />
                <Button
                  style={{
                    position: "absolute",
                    top: "85%",
                    backgroundColor: "transparent",
                    borderStyle: "none",
                    alignItems: "right",
                    width: "90%",
                    textAlign: "right",
                    color: "white",
                    textShadow: "2px 2px 2px black",
                  }}
                  onClick={() => this.onClickButton(item, false)}
                >
                  More Detail
                </Button>
              </Card>
            )) : <div>No data.</div>
          }
        </div>
        <div
          style={{ maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "75%", justifyContent: "center" }}
        >
          <h2 style={{ textAlign: "center", marginTop: "100px", fontStyle: "italic", color: "#343434", opacity: 0.8 }}>
            Closed Proof
          </h2>
          <div style={{ width: "89px", height: "4px", backgroundColor: "#5c5c5d", margin: "20px auto 130px", borderRadius: "2px" }}></div>
        </div>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "auto", 
            width: "90%", justifyContent: "flex-start", listStyle: "none", flexWrap: "wrap", 
            padding: "0", }}
        >
          {
            this.state.finishedItems.length > 0 ? this.state.finishedItems.map((item, index) => (
              <Card
                style={{ width: "275px", height: "275px", margin: "20px", boxShadow: "0 0 8px 3px rgba(217, 217, 217, 0.5)" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              >
                <div style={{ position: "absolute", top: "5%", color: "white", textShadow: "2px 2px 2px black" }}>
                  { this.project[item.projectNo].title }
                </div>
                <div style={{ position: "absolute", top: "75%", color: "white", textShadow: "2px 2px 2px black" }}>
                  { this.handleTime(item.timestamp) }
                </div>
                <Button
                  style={{
                    position: "absolute",
                    top: "85%",
                    backgroundColor: "#fafafa",
                    borderStyle: "none",
                    alignItems: "center",
                    textAlign: "center",
                    color: item.like.includes(address) ? "#2f54eb" :
                          item.dislike.includes(address) ? "#eb2f2f" : "#404040", 
                    height: "22px",
                    fontSize: "12px"
                  }}
                  onClick={() => this.onClickButton(item, true)}
                >
                  {
                    item.like.includes(address) ? "Success" :
                    item.dislike.includes(address) ? "Fail" : "Timeout" 
                  }
                </Button>
              </Card>
            )) : <div>No data.</div>
          }
        </div>
        <ProofCard 
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          visible={this.state.visible}
          proof={ this.state.selectedItem }
          disable={ this.state.disable }
        />
      </div>
    );
  }
}

export default JudgePage;
