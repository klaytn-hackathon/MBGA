import React from "react";
import InfiniteScroll from 'react-infinite-scroller';
import { Card, Button } from 'antd';
import NoLoginHome from '../components/NoLoginHome';

const style = {
  height: 30,
  border: "1px solid green",
  margin: 6,
  padding: 8
};

class ExplorePage extends React.Component {
  state = {
    items: Array.from({ length: 12 })
  };

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

  refresh = () => {
    setTimeout(() => {
      this.setState({
        items: Array.from({ length: 12 }),
      });
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

  componentDidMount() {
    window.addEventListener("scroll", this.infiniteScroll, true);
  }

  render() {
    const { Meta } = Card;
    return (
      
        <div>
          <NoLoginHome />
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

export default ExplorePage;
