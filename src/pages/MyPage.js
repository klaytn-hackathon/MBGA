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
      proof.startDate = this.project[proof.projectNo].info.startDate;
      proof.endDate = this.project[proof.projectNo].info.endDate;
      const refereeList = this.project[proof.projectNo].referees;

      if(new Date().getTime() / 1000 > proof.timestamp * 1 + 48 * 3600) {
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
            else if(proof.like.length + 5 * (successCount - failCount) + 5 >= proof.dislike.length) {
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

  handleTime = timestamp => {
    const startDate = new Date(timestamp * 1000);
    return `${startDate.getFullYear()}. ${startDate.getMonth() + 1}. ${startDate.getDate()}`;
  }

  render() {
    const { Meta } = Card;
    const { isLoggedIn } = this.props.auth.values;
    return (
      <div style={{backgroundColor: "#ffffff"}}>
        <LoginHome fromPage="my" />
        <div style={{ marginTop: "80px", width: "100%", textAlign: "center" }}>
          <div style={{ textAlign: "center", marginTop: "100px", fontStyle: "italic", color: "#343434", fontSize: "24px", opacity: 0.8 }}>MY terminated Challenge</div>
          <div style={{ width: "89px", height: "4px", backgroundColor: "#2f54eb", margin: "20px auto 50px", borderRadius: "2px" }}></div>
        </div>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "auto", 
            width: "90%", justifyContent: "flex-start", listStyle: "none", flexWrap: "wrap", 
            padding: "0", }}
        >
          {
            this.state.items.length > 0 ? this.state.items.map((item, index) => (
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
                    color: item.status === true ? "#2f54eb" :
                          item.status === false ? "#eb2f2f" : "#404040", 
                    height: "22px",
                    fontSize: "12px"
                  }}
                  onClick={() => this.onClickButton(index)}
                >
                  {
                    item.status === true ? "Success" :
                    item.status === false ? "Fail" : "Waiting" 
                  }
                </Button>
              </Card>
            )) : <div>No Data.</div>
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
