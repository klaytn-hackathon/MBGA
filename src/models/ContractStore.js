import { observable, action } from 'mobx';
import { cav } from 'klaytn/caver';

export default class ContractStore {
  @observable myProjects = [];
  @observable myProjectCount = 0;
  @observable allProjects = [];
  @observable allProjectCount = 0;
  @observable myJudges = [];
  @observable myJudgeCount = 0;
  @observable allProofs = [];
  @observable allProofCount = 0;

  @action 
  resetMine() {
    this.myProjects = [];
    this.myProjectCount = 0;
    this.myJudges = [];
    this.myJudgeCount = 0;
    return Promise.resolve();
  }

  @action
  loadMyProject() {

  }

  @action
  loadAllProject() {

  }
};