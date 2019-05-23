import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import ExplorePage from "./ExplorePage";
import NotJudgePage from "./NotJudgePage";
import CreateProjectPage from './CreateProjectPage';
import InputDatePage from './InputDatePage';
import InputKlayPage from './InputKlayPage';

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

    if(page == "3") {
      return (
        <CreateProjectPage />
      );
    }

    if(page == "4") {
      return (
        <InputKlayPage />
      );
    }

    if(page == "5") {
      return (
        <InputDatePage />
      );
    }

    return (
      <h1>explore</h1>
    );
  };
};

export default RenderingPage;