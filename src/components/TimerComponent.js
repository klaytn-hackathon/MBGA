import React, { Component } from 'react';

class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.props.endDate * 1000 - new Date().getTime(),
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
    const day = Math.floor(totalSec / (24 * 3600));
    const hour = Math.floor((totalSec % (24 * 3600)) / 3600);
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
    return `${day}일 ${hourStr}:${minStr}:${secStr}`
  }

  render() {
    return(
      <div style={this.props.style}>
        {
          this.state.time > 0 ? `남은 도전 기간 ${this.makeRemainStr(this.state.time)}` : "도전이 종료되었습니다." 
        }
      </div>
    );
  }
}

export default Timer;


