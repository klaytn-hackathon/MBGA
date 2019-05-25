import { observable, action } from 'mobx';
import { cav } from 'klaytn/caver';

export default class AuthStore {
  @observable inProgress = false;
  @observable errors = void 0;

  @observable values = {
    privateKey: '',
    address: '',
    isLoggedIn: !!sessionStorage.getItem('walletInstance'),
    page: "1",
  };

  @action 
  reset() {
    this.values.privateKey = '';
    this.values.address = '';
    this.values.isLoggedIn = false;
    this.values.page = '1';
    this.errors = void 0;
    this.inProgress = false;
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
      this.values.page = "1";
      this.errors = void 0;
    }).catch((err) => {
      console.log(err);
      this.errors = err;
      action((err) => {
        throw err;
      })
    }).finally(() => {
      this.inProgress = false;
      action(() => {})
    });
  }

  @action
  openPage(page) {
    this.values.page = page;
  }
};