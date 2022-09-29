import { createApp } from 'https://unpkg.com/petite-vue?module';

createApp({
    email: null,
    password: null,
    passwordRepeat: null,
    acceptTermsPrivacy: false,
    showPopover: false,
    validations: [
        {
            hint: 'Contains a lowercase character',
            rule: new RegExp('(?=.*[a-z])'),
            valid: false,
        },
        {
            hint: 'Contains an uppercase character',
            rule: new RegExp('(?=.*[A-Z])'),
            valid: false,
        },
        {
            hint: 'Contains a number',
            rule: new RegExp('(?=.*[0-9])'),
            valid: false,
        },
        {
            hint: 'Contains a special character',
            rule: new RegExp('(?=.*[^A-Za-z0-9])'),
            valid: false,
        },
        {
            hint: 'Contains at least 8 characters',
            rule: new RegExp('(?=.{8,})'),
            valid: false,
        },
    ],
    get validationHtml() {
        let html = '<ul class="pl-3 ">';
        for (const v of this.validations) {
            const classes = v.valid ? 'text-success' : 'text-danger';
            html += `<li class="small ${classes}">${v.hint}</li>`;
        }
        html += '</ul>';
        return html;
    },
    get validEmail() {
        return (
            this.email &&
            this.email.match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
        );
    },
    get validPassword() {
        return this.password && this.validatePassword(this.password);
    },
    get validPasswordRepeat() {
        return this.passwordRepeat && this.passwordRepeat === this.password;
    },
    get invalidRules() {
        return this.validations.filter((r) => !r.valid);
    },
    validatePassword(password) {
        for (const index in this.validations) {
            this.validations[index].valid = this.validations[index].rule.test(password);
        }
        return !this.validations.filter((v) => !v.valid).length;
    },
}).mount();
