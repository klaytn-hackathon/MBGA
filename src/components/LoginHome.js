import React, { Component } from "react";
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input } from 'antd';
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
              blablabla
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
