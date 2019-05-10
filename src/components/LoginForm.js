import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, TextField } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
//import { } from '@material-ui/icons';

const styles = {
  loginForm: {
    position: "absolute",
    width: "60%",
    minWidth: "360px",
    maxWidth: "720px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fbfbfb"
  },
  privateKeyField: {
    width: "90%",
    height: "60px",
    margin: "15px auto 0px auto",
    display: "flex"
  },
  loginBtn: {
    width: "90%",
    margin: "5px auto 15px",
    display: "block",
    height: "40px"
  }
};

@inject('auth')
@observer
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey: "",
      showPassword: true,
    };
  };

  componentWillMount() {
    
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleClickShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  onLoginBtnClick = () => {
    this.props.auth.login(this.state.privateKey);
  };

  onLogoutBtnClick = () => {
    this.props.auth.reset();
  }

  render() {
    const { errors } = this.props.auth;
    return (
      <div className="LoginForm" style={styles.loginForm}>
        <TextField 
          id="outlined-uncontrolled"
          label="Login with Private Key"
          placeholder="0x2c4078447..."
          multiline
          name="privateKey"
          type={this.state.showPassword ? 'text' : 'password'}
          value={this.state.privateKey}
          margin="normal"
          variant="outlined"
          onChange={this.handleChange('privateKey')}
          style={styles.privateKeyField}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={this.handleClickShowPassword}
                >
                  {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          onClick={this.onLoginBtnClick}
          style={styles.loginBtn}
          color="default"
          variant="contained"
        >
          Log In
        </Button>
        {
          errors != void 0 ? <div style={{marginLeft: "5%", color: "red"}}> 
            { errors.message } 
          </div> : <div>
          </div>
        }
      </div>
    );
  }
}

export default LoginForm;