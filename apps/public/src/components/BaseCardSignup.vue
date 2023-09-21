<template>
    <div>
        <validation-observer ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(submit)" id="cardBetaSignupForm">
                <validation-provider name="email" :rules="{ required: true, email: true }" v-slot="validationContext">
                    <b-input-group>
                        <b-form-input
                            :class="inputClass"
                            v-model="email"
                            type="email"
                            label="email"
                            placeholder="E-mail address"
                            :state="getValidationState(validationContext)"
                        />
                        <b-input-group-append>
                            <b-button
                                type="submit"
                                variant="primary"
                                form="cardBetaSignupForm"
                                style="border-top-right-radius: 25px; border-bottom-right-radius: 25px"
                            >
                                <span>Sign up for free</span>
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                </validation-provider>
            </b-form>
        </validation-observer>
    </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DASHBOARD_URL } from '../config/secrets';

@Component({
    name: 'BaseCardSignup',
    components: {},
})
export default class BaseCardSignup extends Vue {
    loading = false;
    isSuccess = false;
    error = '';
    email = '';

    @Prop({ default: `bg-white border-light` }) inputClass!: string;

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }

    async submit() {
        let url = `${DASHBOARD_URL}/signup`;
        if (this.email) {
            url += `?signup_email=${this.email}`;
        }
        window.location.href = url;
    }
}
</script>
<style lang="scss" scoped>
.input-group-append {
    margin-left: -2px;
}
</style>
