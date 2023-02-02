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
    email: '',
    isLoading: false,
    get isDisabled() {
        return this.email
            ? !this.email.match(
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              )
            : true;
    },
    onClickSubmit() {
        this.isLoading = true;
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
        // Check for mobile
        const isMobile = window.matchMedia('(pointer:coarse)').matches;
        if (isMobile) {
            try {
                const url = new URL(document.getElementsByName('claimUrl')[0].value || window.location.href);
                const link = url.href.replace(/.*?:\/\//g, '');
                window.open('https://metamask.app.link/dapp/' + link, '_blank');
            } catch (error) {
                console.log(error);
            }
        }
        // If not mobile check for metamask to be installed
        else if (typeof window.ethereum !== 'undefined') {
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
        }
        // If not installed show error
        else {
            this.alert.message = ERROR_INSTALL_METAMASK;
            console.info(ERROR_INSTALL_METAMASK);
        }
    },
}).mount();

/* eslint-enable no-undef */
