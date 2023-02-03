import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/petite-vue/0.4.1/petite-vue.es.js';

const { ethereum } = window;

/* eslint-disable no-undef */
const AUTH_REQUEST_MESSAGE = document.getElementsByName('authRequestMessage')[0].value;
const ERROR_CONNECT_METAMASK = 'Please connect to MetaMask.';
const ERROR_INSTALL_METAMASK = 'Please install MetaMask.';

createApp({
    isMounted: false,
    alert: { variant: 'warning', message: '' },
    email: '',
    isLoading: false,
    isDisabledMetamask: false,
    get isDisabled() {
        return this.email
            ? !this.email.match(
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              )
            : true;
    },
    onMounted() {
        this.isMounted = true;
    },
    onClickSubmit() {
        this.isLoading = true;
    },
    onAccountsChanged(accounts) {
        if (!accounts.length) {
            this.alert.message = ERROR_CONNECT_METAMASK;
        } else {
            ethereum
                .request({
                    method: 'eth_signTypedData_v3',
                    params: [accounts[0], AUTH_REQUEST_MESSAGE],
                })
                .then((signature) => {
                    document.getElementsByName('authRequestSignature')[0].value = signature;
                    document.getElementById('form-signin').submit();
                })
                .catch((err) => {
                    if (err.code === 4001) {
                        this.alert.message = ERROR_CONNECT_METAMASK;
                    }
                });
        }
    },
    requestAccounts() {
        ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(this.onAccountsChanged)
            .catch((err) => {
                if (err.code === 4001) {
                    this.alert.message = ERROR_CONNECT_METAMASK;
                } else {
                    console.error(err);
                }
            });
    },
    async onClickSigninMetamask() {
        if (this.isDisabledMetamask) return;
        const isMobile = window.matchMedia('(pointer:coarse)').matches;

        this.isDisabledMetamask = true;

        if (ethereum) {
            this.requestAccounts();
        } else if (isMobile && !ethereum) {
            const claimUrlInput = document.getElementsByName('claimUrl');
            const claimUrl = claimUrlInput.length ? claimUrlInput[0].value : '';
            const returnUrlInput = document.getElementsByName('returnUrl');
            const returnUrl = returnUrlInput.length ? returnUrlInput[0].value : '';
            const url = new URL(claimUrl || returnUrl);
            const link = url.href.replace(/.*?:\/\//g, '');

            window.open('https://metamask.app.link/dapp/' + link, '_blank');
        } else {
            this.alert.message = ERROR_INSTALL_METAMASK;
            console.log(ERROR_INSTALL_METAMASK);
        }

        this.isDisabledMetamask = false;
    },
}).mount();

/* eslint-enable no-undef */
