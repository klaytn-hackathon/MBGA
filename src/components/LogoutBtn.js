import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button } from 'antd';

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
          shape="round"
          onClick={this.onLogoutBtnClick}
          size="small"
          ghost
        >
          logout
        </Button>
        
      </div>
    );
  }
}

export default LogoutBtn;