import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/petite-vue/0.4.1/petite-vue.es.js';

createApp({
    otp: '',
    isLoading: null,
    onInput() {
        if (this.otp.length === 5) {
            this.isLoading = true;
            setTimeout(() => {
                this.$refs.submit.click();
            }, 1000);
        }
    },
}).mount();
