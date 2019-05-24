import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NotJudgePage from './NotJudgePage';
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
  };
  itemList = [];

  fetchMoreData = () => {
    // a fake async api call like which sends
    // 20 more records in 1.5 secs
    setTimeout(() => {
      this.setState({
        items: this.state.items.concat(Array.from({ length: 12 }))
      });
      window.addEventListener("scroll", this.infiniteScroll, true);
    }, 1500);
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
      
        <div style={{backgroundColor: "#ffffff"}} >
          {
            isLoggedIn ? <LoginHome /> : <NoLoginHome />
          }
          <h2 style={{ textAlign: "center", marginTop: "100px"}}>다른 사람의 Life</h2>
            <div
              className="ExplorePage-InfiniteScroll"
              style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "10px auto", width: "70%", justifyContent: "space-between", listStyle: "none", flexFlow: "row wrap", padding: "0" }}
            >
            {
              this.state.items.map((i, index) => (
                <Card
                    style={{ width: "360px", height: "360px", margin: "30px auto" }}
                  >
                    <Meta
                      title={`${index}Cdfdfdfdfdfdfdfdfdfdfdfdfdfdf`}
                    />
                    <br/> 
                    <Button style={{ height: "90px", fontSize: "30px", position: "absolute", top: "240px", left: "30px", width: "300px" }}>
                      내역 보기
                    </Button>
                  </Card>
              ))
            }
          </div>
        </div>
    );
  }
}

export default JudgePage;
