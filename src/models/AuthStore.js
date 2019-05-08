import { observable, action } from 'mobx';
import { cav } from 'klaytn/caver';

export default class AuthStore {
  @observable inProgress = false;
  @observable errors = void 0;

  @observable values = {
    privateKey: '',
    address: '',
    isLoggedIn: !!sessionStorage.getItem('walletInstance'),
    page: 0,
  };

  @action 
  reset() {
    this.values.privateKey = '';
    this.values.address = '';
    this.values.isLoggedIn = false;
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    return Promise.resolve();
  }

  @action 
  login(privateKey) {
    this.inProgress = true;
    return new Promise((resolve, reject) => {
      try {
        const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
        resolve(walletInstance);
      } catch (e) {
        reject(e);
      }
    }).then((walletInstance) => {
      cav.klay.accounts.wallet.add(walletInstance);
      sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
      this.values.address = walletInstance.address;
      this.values.isLoggedIn = true;
      this.values.page = 0;
    }).catch((e) => {
      console.log(e);
      action((err) => {
        this.errors = err;
        throw err;
      })
    }).finally(() => {
      action(() => { this.inProgress = false; })
    });
  }

  @action
  openPage(page) {
    this.values.page = page;
  }
};