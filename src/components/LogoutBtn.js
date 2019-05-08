import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button } from '@material-ui/core';
//import { } from '@material-ui/icons';

@inject('auth')
@observer
class LogoutBtn extends Component {
  onLogoutBtnClick = () => {
    this.props.auth.reset();
  }

  render() {
    return (
      <div className="Logout">
        <Button
          onClick={this.onLogoutBtnClick}
        >
          Log Out
        </Button>
        
      </div>
    );
  }
}

export default LogoutBtn;