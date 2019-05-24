import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NotJudgePage from './NotJudgePage';
import ProofCard from '../components/ProofCard';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

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

  fetchMoreData = async () => {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const newJudgeItems = [];
    const newFinishedItems = [];
    const address = this.props.auth.values.address;
    const judgeLength = this.state.judgeItems.length;
    const finishedLength = this.state.finishedItems.length;
    for (let i = this.itemList.length - 1 - judgeLength - finishedLength; i >= 0; i -= 1) {
      const item = await contract.methods.getProof(this.itemList[i] * 1).call();
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
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const refereeList = await contract.methods.getWhiteList().call();
    const address = this.props.auth.values.address;
    
    if(address == void 0 || address.length === 0) {
      alert("use after sign in");
      this.props.auth.openPage("1");
    }
    
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
    const like = this.state.items[this.state.index].like;
    const dislike = this.state.items[this.state.index].dislike;
    const address = this.props.auth.values.address;
    if(like.includes(address) || dislike.includes(address)) {
      alert("you already voted!");
      return;
    }
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.likeProof(this.state.items[this.state.index].proofNo).estimateGas({ 
        from: address
      });
      contract.methods.likeProof(this.state.items[this.state.index].proofNo).send({ 
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
        this.props.auth.openPage(1);
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
      const like = this.state.items[this.state.index].like;
      const dislike = this.state.items[this.state.index].dislike;
      const address = this.props.auth.values.address;
      if(like.includes(address) || dislike.includes(address)) {
        alert("you already voted!");
        return;
      }
      try {
        const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
        const gasAmount = await contract.methods.dislikeProof(this.state.items[this.state.index].proofNo).estimateGas({ 
          from: this.props.auth.values.address
        });
        contract.methods.dislikeProof(this.state.items[this.state.index].proofNo).send({ 
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
          this.props.auth.openPage(1);
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
        this.props.auth.openPage(1);
        this.props.auth.openPage(2);
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
    const { isLoggedIn } = this.props.auth.values;
    return (
      <div style={{backgroundColor: "#ffffff", marginTop: "70px"}} >
        <div style={{ justifyContent: "center", display: "flex"}} >
          <div
            style={{ 
              maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "70%", 
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "left", fontSize: "30px", fontWeight: "lighter" }}>
                나의 판정
            </div>
            <Button 
                type="link" 
                ghost
                style={{fontSize: "30px", fontWeight: "lighter", color:"#343434"}}
                onClick={this.cancelReferee}
              >
              <div style={{borderBottom: "1px solid #343434"}}>판사 취소하기</div>
            </Button>
          </div>
        </div>
        <div
          style={{ maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "70%" }}
        >
          <h2 style={{ textAlign: "left", marginTop: "150px", fontSize: "30px", fontWeight: "lighter" }}>
            확인해야 할 인증
          </h2>
        </div>
        <div>
          {
            this.state.judgeItems.map((item, index) => (
              <Card
                style={{ width: "360px", height: "360px", margin: "30px auto" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              > 
                <Button 
                  style={{
                    height: "90px", fontSize: "30px", position: "absolute", 
                    top: "240px", left: "30px", width: "300px" 
                  }}
                  onClick={() => this.onClickButton(item, false)}
                >
                  내역 보기
                </Button>
              </Card>
            ))
          }
        </div>
        <div
          style={{ maxWidth: "1300px", minWidth: "375px", margin: "0px auto", width: "70%" }}
        >
          <h2 style={{ textAlign: "left", marginTop: "150px", fontSize: "30px", fontWeight: "lighter"}}>
            이미 종료한 인증
          </h2>
        </div>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "10px auto", width: "70%", justifyContent: "space-between", listStyle: "none", flexFlow: "row wrap", padding: "0" }}
        >
          {
            this.state.finishedItems.map((item, index) => (
              <Card
                style={{ width: "360px", height: "360px", margin: "30px auto" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              > 
                <Button 
                  style={{
                    height: "90px", fontSize: "30px", position: "absolute", 
                    top: "240px", left: "30px", width: "300px" 
                  }}
                  onClick={() => this.onClickButton(item, true)}
                >
                  내역 보기
                </Button>
              </Card>
            ))
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
