import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Row, Col } from 'antd';
import NoLoginHome from './NoLoginHome';

@inject('auth', 'contract')
@observer
class LoginHome extends Component {
  state = { loading: false, contractCount: 0, items: [1,2] };

  clickStart = () => {
    const { isLoggedIn } = this.props.auth.values;
    if(isLoggedIn) {
      // this.props.auth.reset();
      // this.props.contract.resetMine();
    } else {
      this.showModal();
    }
  }

  componentDidMount() {

  }

  render() {
    const { errors, values } = this.props.auth;
    console.log(this.state.items);
    if(this.state.loading) {
      return <div style={{textAlign: "center"}}>Loading...</div>
    }
    // if(this.state.contractCount === 0) {
    //   return <NoLoginHome />;
    // }
    return (
      <div style={{ justifyContent: "center",  display: "block" }}>
        <div style={{ justifyContent: "center", alignItems: "center", height: "170px", display: "flex" }}>
          <div style={{ textAlign: "center", fontSize: "30px", fontWeight: "lighter"}}>MyLife</div>
        </div>
        {
          this.state.items.map((i, index) => {
            return (
              <div style={{ height: "232px", borderTop: "1px solid #979797", borderBottom: "1px solid #979797", marginBottom: "22px"}}>
                <Row type="flex" align="center" justify="center" style={{ height: "100%" }}>
                  <Col span={12} style={{ maxWidth: "1400px", minWidth: "375px", alignItems: "center", display: "flex" }}>
                    <div style={{ float: "left", alignItems: "center" }}>
                      <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434"}}> 
                        매일 하루에 한번씩 운동하기
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "lighter", color: "#979797", marginTop: "42px"}}>
                        남은 도전 기간 35:24:12
                      </div>
                    </div>
                  </Col>
                  <Col span={6} style={{alignItems: "center", display: "flex", justifyContent: "flex-end"}}>
                    <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
                      <div style={{ marginRight: "15px"}}>
                        인증완료
                      </div>
                    </div>  
                  </Col>
                </Row>
              </div>
            );
          })
        }
        <div style={{ justifyContent: "center", alignItems: "center", textAlign: "center", marginTop: "20px", fontSize: "30px", fontWeight: "lighter", textDecoration: "underline"}}>
          새로운 도전하기
        </div>
      </div>
    );
  }
}

export default LoginHome;
