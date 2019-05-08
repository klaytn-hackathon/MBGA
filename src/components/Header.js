import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import AppBar from '@material-ui/core/AppBar';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Hidden from '@material-ui/core/Hidden';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Search from '@material-ui/icons/Search';
import LogoutBtn from './LogoutBtn';
import logo from '../static/logo.png';

@inject('auth')
@observer
class Header extends Component {

  handleChange = (event, value) => {
    this.props.auth.openPage(value);
  };

  render() {
    const { page } = this.props.auth.values;
    return (
      <div className="Header">
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar>
            <img alt="logo" src={logo} className="poc-logo" height="30 px" style={{ margin: "0px 20px 0px 0px" }}/>
            <Grid container alignItems="center">
              <Grid item xs={9}>
                <Tabs value={page} onChange={this.handleChange} variant="scrollable" indicatorColor="primary">
                  <Tab value={0} label="home" />
                  <Tab value={1} label="explore" />
                  <Tab value={2} label="judge" />
                  <Tab value={3} label="other.." />
                </Tabs>
              </Grid>
              <Hidden xsDown >
                <Grid item xs={3}>
                  <TextField
                    variant="outlined"
                    placeholder="Search"
                  />
                </Grid>
              </Hidden>
            </Grid>

            <div style={{ margin:"0px 8px",  width:"75px" }}>
                wallet
            </div>
            <div style={{ margin:"0px 8px", width:"120px" }}>
              <LogoutBtn />
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  };
};

export default Header;