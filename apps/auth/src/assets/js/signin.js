import { createApp } from 'https://unpkg.com/petite-vue?module';

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
    waitForEthereumInit: new Promise((resolve, reject) => {
        window.addEventListener('ethereum#initialized', resolve(), {
            once: true,
        });

        // If the event is not dispatched by the end of the timeout,
        // the user probably doesn't have MetaMask installed.
        setTimeout(reject(ERROR_INSTALL_METAMASK), 3000); // 3 seconds
    }),
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
    async signin() {
        if (this.isDisabledMetamask) return;
        this.isDisabledMetamask = true;

        const provider = await detectEthereumProvider();
        const isMobile = window.matchMedia('(pointer:coarse)').matches;

        if (provider) {
            this.requestAccounts();
        } else if (isMobile) {
            const claimUrlInput = document.getElementsByName('claimUrl');
            const claimUrl = claimUrlInput.length ? claimUrlInput[0].value : '';
            const returnUrlInput = document.getElementsByName('returnUrl');
            const returnUrl = returnUrlInput.length ? returnUrlInput[0].value : '';
            const url = new URL(claimUrl || returnUrl);
            const link = url.href.replace(/.*?:\/\//g, '');
            alert(link);
            window.open('https://metamask.app.link/dapp/' + link, '_blank');
        } else {
            this.alert.message = ERROR_INSTALL_METAMASK;
            alert(ERROR_INSTALL_METAMASK);
        }

        this.isDisabledMetamask = false;
    },
}).mount();

/* eslint-enable no-undef */
