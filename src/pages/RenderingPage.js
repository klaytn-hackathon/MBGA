import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject('auth')
@observer
class RenderingPage extends Component {
  render() {
    const { page } = this.props.auth.values;
    if(page == 0) {
      return (
        <h1>home</h1>
      );
    }

    if(page == 1) {
      return (
        <h2>explore</h2>
      );
    }

    if(page == 2) {
      return (
        <h3>judge</h3>
      );
    }

    return (
      <h4>other....</h4>
    );
  };
};

export default RenderingPage;