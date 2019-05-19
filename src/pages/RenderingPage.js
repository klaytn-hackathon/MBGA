import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import ExplorePage from "./ExplorePage";
import NotJudgePage from "./NotJudgePage";

@inject('auth')
@observer
class RenderingPage extends Component {
  render() {
    const { page, isLoggedIn } = this.props.auth.values;
    if(page == "1") {
      return (
        <ExplorePage />
      );
    }

    if(page == "2") {
      return (
        <NotJudgePage />
      );
    }

    return (
      <h1>explore</h1>
    );
  };
};

export default RenderingPage;