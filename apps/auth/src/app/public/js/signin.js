import { createApp } from 'https://unpkg.com/petite-vue?module';

/* eslint-disable no-undef */
const AUTH_REQUEST_MESSAGE = document.getElementsByName('authRequestMessage')[0].value;
const ERROR_CONNECT_METAMASK = 'Please connect to MetaMask.';
const ERROR_INSTALL_METAMASK = 'Please install MetaMask.';

createApp({
    alert: {
        variant: 'warning',
        message: '',
    },
    onAccountsChanged(accounts) {
        if (!accounts.length) {
            this.alert.message = ERROR_CONNECT_METAMASK;
        } else {
            window.ethereum
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
    signin() {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(this.onAccountsChanged)
                .catch((err) => {
                    if (err.code === 4001) {
                        this.alert.message = ERROR_CONNECT_METAMASK;
                    } else {
                        console.error(err);
                    }
                });
        } else {
            this.alert.message = ERROR_INSTALL_METAMASK;
            console.info(ERROR_INSTALL_METAMASK);
        }
    },
}).mount();

/* eslint-enable no-undef */
