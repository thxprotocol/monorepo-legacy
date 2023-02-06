import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/petite-vue/0.4.1/petite-vue.es.js';

createApp({
    otpValues: {},
    otp: '',
    isLoading: false,
    onInput(key, value) {
        this.otpValues[key] = value.data[0];
        this.otp = Object.values(this.otpValues).join('');

        if (key !== 4) {
            document.getElementById(`digit${++key}`).focus();
        }

        if (this.otp.length === 5) {
            this.isLoading = true;
            setTimeout(() => {
                this.$refs.submit.click();
            }, 1000);
        }
    },
}).mount();
