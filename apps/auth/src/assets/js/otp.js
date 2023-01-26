import { createApp } from 'https://unpkg.com/petite-vue?module';

createApp({
    otpValues: {},
    isLoading: false,
    otp: '',
    onInput(key, value) {
        this.otpValues[key] = value.data[0];
        this.otp = Object.values(this.otpValues).join('');

        document.getElementById('form-otp').reportValidity();

        if (this.otp.length === 5) {
            this.isLoading = true;
            setTimeout(() => {
                this.$refs.submit.click();
            }, 1000);
        }
    },
}).mount();
