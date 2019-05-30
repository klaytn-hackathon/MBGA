import React, { Component } from 'react';

class RemainTimer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.timestamp * 1000 + 24 * 3600 * 1000 * 2 - new Date().getTime(),
    }
  }

  componentDidMount() {
    if(this.state.time >= 0) {
      this.timer = setInterval(() => this.setState({
        time: this.state.time - 1000
      }), 1000)
    }
  }

  compoentWillUnmount() {
    if(this.timer != void 0) {
      clearInterval(this.timer);
    }
  }

  makeRemainStr = (time) => {
    const totalSec = Math.floor(time / 1000);
    const hour = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = Math.floor(totalSec % 60);
    let hourStr = `${hour}`;
    if(hour < 10) {
      hourStr = `0${hour}`;
    }
    let minStr = `${min}`;
    if(min < 10) {
      minStr = `0${minStr}`;
    }
    let secStr = `${sec}`;
    if(sec < 10) {
      secStr = `0${sec}`;
    }
    return `${hourStr}:${minStr}:${secStr}`
  }

  render() {
    return(
      <div style={this.props.style}>
        {
          this.state.time > 0 ? `Remain Time ${this.makeRemainStr(this.state.time)}` : "시간이 종료되었습니다." 
        }
      </div>
    );
  }
}

export default RemainTimer;


