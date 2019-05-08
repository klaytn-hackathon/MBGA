import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, TextField } from '@material-ui/core';
//import { } from '@material-ui/icons';

@inject('auth')
@observer
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: "",
    };
  };

  componentWillMount() {
    
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onLoginBtnClick = () => {
    this.props.auth.login(this.state.privateKey);
  };

  onLogoutBtnClick = () => {
    this.props.auth.reset();
  }

  render() {
    return (
      <div className="Login">
        <TextField 
          id="outlined-uncontrolled"
          label="Login with Private Key"
          placeholder="0x2c4078447..."
          multiline
          name="privateKey"
          value={this.state.privateKey}
          margin="normal"
          variant="outlined"
          onChange={this.handleChange('privateKey')}
        />
        <Button
          onClick={this.onLoginBtnClick}
        >
          Log In
        </Button>
          
      </div>
    );
  }
}

export default Login;