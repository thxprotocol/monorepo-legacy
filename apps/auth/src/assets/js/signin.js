import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/petite-vue/0.4.1/petite-vue.es.min.js';

/* eslint-disable no-undef */

createApp({
    isMounted: false,
    alert: { variant: 'warning', message: '' },
    email: '',
    isIframe: window.matchMedia('(pointer:coarse)').matches,
    isMobile: window.matchMedia('(pointer:coarse)').matches,
    isLoading: false,
    get isDisabled() {
        return this.email
            ? !this.email.match(
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              )
            : true;
    },
    onMounted() {
        const isWidgetInput = document.getElementsByName('isWidget');
        const returnUrlInput = document.getElementsByName('returnUrl');
        const claimUrlInput = document.getElementsByName('claimUrl');
        const signupEmailInput = document.getElementsByName('signupEmail');
        this.email = signupEmailInput.length ? signupEmailInput[0].value : '';
        this.isWidget = isWidgetInput.length ? JSON.parse(isWidgetInput[0].value) : false;
        this.returnUrl = returnUrlInput.length ? returnUrlInput[0].value : '';
        this.claimUrl = claimUrlInput.length ? claimUrlInput[0].value : '';
        this.isMounted = true;
    },
    onClickReturn() {
        if (window.opener) {
            window.close();
        } else {
            window.location.href = this.returnUrl;
        }
    },
    onClickSubmit() {
        this.isLoading = true;
    },
}).mount();

/* eslint-enable no-undef */
