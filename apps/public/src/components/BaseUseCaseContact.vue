<template>
    <b-card bg-variant="light" body-class="p-lg-5" class="mb-5 border-0">
        <div class="p-lg-5">
            <div class="text-center pt-5 pt-lg-5 pt-xl-4">
                <h2 class="h5">Contact us</h2>
                <p class="h2 lead mb-4 font-size-l">Let's explore your use case</p>
                <p>
                    We offer a number of integrations with community software but the possibilities are endless. Don't
                    hesitate to reach out and explore your use case.
                </p>
            </div>

            <div class="d-flex align-items-center justify-content-center p-3" v-if="loading">
                <b-spinner variant="dark"></b-spinner>
            </div>
            <validation-observer v-else ref="observer" v-slot="{ handleSubmit }">
                <b-alert show variant="danger" v-if="error">
                    {{ error }}
                    Try reaching us on <a href="https://discord.gg/TzbbSmkE7Y" target="_blank">Discord</a>
                </b-alert>
                <div class="text-left">
                    <b-alert show variant="success" v-if="success"> {{ success }} </b-alert>

                    <b-form @submit.stop.prevent="handleSubmit(submit)" id="formContact">
                        <label class="font-weight-bold mt-5">Name</label>
                        <div class="form-group row">
                            <div class="col-sm-6">
                                <validation-provider
                                    name="First name"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="firstName"
                                        placeholder="First name"
                                        label="First name"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </div>
                            <div class="col-sm-6">
                                <validation-provider
                                    name="Last name"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="lastName"
                                        label="Last name"
                                        class="form-control-underlined"
                                        placeholder="Last name"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </div>
                        </div>
                        <label class="font-weight-bold mt-5">Email</label>

                        <validation-provider
                            name="E-mail"
                            :rules="{ required: true, email: true }"
                            v-slot="validationContext"
                        >
                            <b-form-input
                                v-model="email"
                                label="E-mail"
                                placeholder="Your e-mail address"
                                class="form-control-underlined"
                                :state="getValidationState(validationContext)"
                            />
                            <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                        </validation-provider>

                        <label class="font-weight-bold mt-5">Case</label>
                        <validation-provider name="Case" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-textarea
                                v-model="message"
                                label="Case"
                                placeholder="Describe your case"
                                class="form-control-underlined"
                                :state="getValidationState(validationContext)"
                            ></b-form-textarea>
                            <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                        </validation-provider>
                    </b-form>
                </div>
                <vue-recaptcha
                    ref="recaptcha"
                    class="w-100 justify-content-center d-flex mt-3 mb-3"
                    :sitekey="googleSiteKey"
                    @verify="isSubmitDisabled = false"
                    @expired="isSubmitDisabled = true"
                    @error="error = 'captcha issue'"
                >
                </vue-recaptcha>
                <b-button
                    variant="outline-primary"
                    :disabled="isSubmitDisabled"
                    class="rounded-pill"
                    type="submit"
                    form="formContact"
                >
                    Send your case
                    <i class="fas fa-chevron-right"></i>
                </b-button>
            </validation-observer>
        </div>
    </b-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
import VueRecaptcha from 'vue-recaptcha';
import { CMS_URL, GOOGLE_SITE_KEY } from '../config/secrets';

@Component({
    components: {
        VueRecaptcha,
    },
})
export default class Contact extends Vue {
    googleSiteKey = GOOGLE_SITE_KEY;
    isSubmitDisabled = true;
    loading = false;
    error = '';
    success = '';

    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    message = '';

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }

    async submit() {
        this.loading = true;

        try {
            const r = await axios({
                url: CMS_URL + '/form-contacts',
                method: 'POST',
                data: {
                    email: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    message: this.message,
                },
            });

            if (r.status !== 200) throw new Error();

            this.email = '';
            this.firstName = '';
            this.lastName = '';
            this.phone = '';
            this.message = '';

            this.success = 'THX! We will respond to your message as soon as possible.';
        } catch (error) {
            console.error(error);
            this.error = 'Oops! Something went wrong...';
        } finally {
            this.loading = false;
        }
        return;
    }
}
</script>

<style scoped>
.form-control-underlined {
    background-color: white;
    color: black;
    padding-left: 1rem;
    padding-right: 1rem;
}
</style>
