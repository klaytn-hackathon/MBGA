import { observable, action } from 'mobx';
import { cav } from 'klaytn/caver';

export default class ContractStore {
  @observable projectName = "";
  @observable startTime = 0;
  @observable endTime = 0;
  @observable betAmount = 0;

  @action 
  reset() {
    this.projectName = "";
    this.startTime = 0;
    this.endTime = 0;
    this.betAmount = 0;
    return Promise.resolve();
  }

  @action
  setProjectName(name) {
    this.projectName = name;
    return Promise.resolve();
  }

  @action
  setPeriod(start, end) {
    this.startTime = start;
    this.endTime = end;
    return Promise.resolve();
  }

  @action
  setBetAmount(klay) {
    this.betAmount = klay;
    return Promise.resolve();
  }
};