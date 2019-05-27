import React from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NoLoginHome from '../components/NoLoginHome';
import LoginHome from '../components/LoginHome';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import ProofCard from '../components/ProofCard';

@inject('auth')
@observer
class MyPage extends React.Component {
  state = {
    items: [],
    index: 0,
    visible: false,
  };
  proofList = [];
  project = {};

  fetchMoreData = async () => {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const newProofs = [];
    for(let i = this.proofList.length - 1 - this.state.items.length; i >= 0; i -= 1) {
      const proof = await contract.methods.getProof(this.proofList[i]).call();
      proof.proofNo = this.proofList[i];
      if(!this.project.hasOwnProperty(proof.projectNo)) {
        const referees = await contract.methods.getProjectReferees(proof.projectNo).call();
        const info = await contract.methods.getProjectInfo(proof.projectNo).call();
        this.project[proof.projectNo] = { referees, info };
      }
      proof.title = this.project[proof.projectNo].info.name;
      const refereeList = this.project[proof.projectNo].referees;
      if(new Date().getTime() / 1000 > proof.timestamp + 48 * 3600) {
        if(proof.judged === 129) {
          proof.status = false;
        } else if(proof.judged === 128) {
          proof.status = true;
        } else {
          let successCount = 0;
          let failCount = 0;
          for(let i = 0; i < 3; i++) {
            if(proof.like.includes[refereeList[i]]) successCount += 1;
            if(proof.dislike.includes[refereeList[i]]) failCount += 1;
            if(successCount >= 2) proof.status = true;
            else if(failCount >= 2) proof.status = false;
            else if(proof.like.length + 5 * (successCount - failCount) + 5 >= proof.dislike.count) {
              proof.status = true;
            } else {
              proof.status = false;
            }
          }
        }
      } else {
        proof.status = void 0;
      }
      newProofs.push(proof);
      // console.log(proof);
      if(newProofs.length === 6) break;
    }
    if(newProofs.length === 0) return;
    this.setState({
      items: this.state.items.concat(newProofs)
    });
    window.addEventListener("scroll", this.infiniteScroll, true);
  };

  onClickButton = (index) => {
    this.setState({
      visible: true,
      index
    })
  }

  infiniteScroll = async () => {
    const scrollHeight = document.querySelector("main").scrollHeight
    const scrollTop = document.querySelector("main").scrollTop;
    const clientHeight = document.querySelector("main").clientHeight;

    if(scrollTop + clientHeight === scrollHeight) {
      window.removeEventListener("scroll", this.infiniteScroll, true);
      this.fetchMoreData();
    }
  }

  async componentDidMount() {
    const address = this.props.auth.values.address;
    if(address == void 0 || address.length === 0) {
      alert("use after sign in");
      this.props.auth.openPage("1");
    }
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const proofList = await contract.methods.getParticipantProofList(address).call();
    console.log(proofList);
    this.proofList = proofList;
    this.fetchMoreData();
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
        this.props.auth.openPage("1");
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
          this.props.auth.openPage("1");
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

  render() {
    const { Meta } = Card;
    const { isLoggedIn } = this.props.auth.values;
    return (
      <div style={{backgroundColor: "#ffffff"}}>
        <LoginHome fromPage="my" />
        <h2 style={{ textAlign: "center", marginTop: "100px"}}>나의 종료된 도전</h2>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "10px auto", width: "75%", justifyContent: "space-between", listStyle: "none", flexFlow: "row wrap", padding: "0" }}
        >
          {
            this.state.items.length > 0 ? this.state.items.map((item, index) => (
              <Card
                style={{ width: "360px", height: "360px", margin: "30px auto" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              > 
                <Button 
                  style={{
                    height: "90px", fontSize: "30px", position: "absolute", 
                    top: "240px", left: "30px", width: "300px" 
                  }}
                  onClick={() => this.onClickButton(index)}
                >
                  내역 보기
                </Button>
              </Card>
            )) : <div>
              내역이 없습니다.
            </div>
          }
        </div>
        <ProofCard 
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          visible={this.state.visible}
          proof={ this.state.items.length > this.state.index ? this.state.items[this.state.index] : null }
        />
      </div>
    );
  }
}

export default MyPage;
