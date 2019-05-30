import React from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NoLoginHome from '../components/NoLoginHome';
import LoginHome from '../components/LoginHome';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import ProofCard from '../components/ProofCard';
import footerBackgroundImage from '../static/challenge2.png'

@inject('auth')
@observer
class ExplorePage extends React.Component {
  state = {
    items: [],
    index: 0,
    visible: false,
  };
  proofCount = 0;
  project = {};

  fetchMoreData = async () => {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const newProofs = [];
    for(let i = this.proofCount - 1 - this.state.items.length; i >= 0; i -= 1) {
      const proof = await contract.methods.getProof(i).call();
      proof.proofNo = i;
      if(!this.project.hasOwnProperty(proof.projectNo)) {
        const info = await contract.methods.getProjectInfo(proof.projectNo).call();
        this.project[proof.projectNo] = { title: info.name };
      }

      newProofs.push(proof);
      // console.log(proof);
      if(newProofs.length === 12) break;
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
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const proofCount = await contract.methods.getAllProofsCount().call();
    this.proofCount = proofCount;
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
        {
          isLoggedIn ? <LoginHome /> : <NoLoginHome />
        }
        <h2 style={{ textAlign: "center", marginTop: "100px", fontStyle: "italic", color: "#343434", opacity: 0.8 }}>
          Exploring Challenge
        </h2>
        <div style={{ width: "89px", height: "4px", backgroundColor: "#2f54eb", margin: "20px auto 130px", borderRadius: "2px" }}></div>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "auto", width: "90%", justifyContent: "flex-start", listStyle: "none", flexWrap: "wrap", padding: "0" }}
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
                  onClick={() => this.onClickButton(index)}
                >
                  More Detail
                </Button>
              </Card>
            )) : <div>내역이 없습니다.</div>
          }
        </div>
        <ProofCard
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          visible={this.state.visible}
          proof={ this.state.items.length > this.state.index ? this.state.items[this.state.index] : null }
        />
        <div style={{ width: "100%", height: "400px", backgroundImage: `url(${footerBackgroundImage})`, backgroundSize: "cover", marginTop: "100px", display: "grid", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", fontStyle: "italic", color: "#343434", fontSize: "24px", opacity: 0.8 }}>START NOW YOU CHALLANGE</div>
          <div style={{ textAlign: "center", color: "#343434", fontSize: "18px", opacity: 0.8 }}>Create challenges and upload images every day! Randomly assigned judges certify. <br /> <br />Once the challenge is complete, it can be recorded forever.</div>
          <div style={{ textAlign: "center"}}>
            <Button
              shape="round"
              onClick={this.clickStart}
              style={{
                maxWidth: "412px", minWidth: "300px", width: "90%", color: "white", backgroundColor: "#2f54eb",
                fontSize: "14px", marginTop: "30px", height: "40px", fontWeight: "lighter"
              }}
            >
              NOW START
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ExplorePage;
