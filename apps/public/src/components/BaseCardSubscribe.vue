<template>
    <div>
        <b-alert v-if="isSuccess" variant="success" show class="mb-2">
            <i class="fas fa-check mr-1"></i>
            You have successfully joined the private beta!
        </b-alert>
        <validation-observer ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(submit)" id="cardBetaSignupForm">
                <validation-provider name="email" :rules="{ required: true, email: true }" v-slot="validationContext">
                    <b-input-group>
                        <b-form-input
                            :class="`bg-${variant} border-${border}`"
                            v-model="email"
                            type="email"
                            label="email"
                            placeholder="E-mail address"
                            :state="getValidationState(validationContext)"
                        />
                        <b-input-group-append>
                            <b-button
                                :variant="button"
                                type="submit"
                                form="cardBetaSignupForm"
                                style="border-top-right-radius: 25px; border-bottom-right-radius: 25px"
                            >
                                <b-spinner v-if="loading" variant="dark"></b-spinner>
                                <template v-else>
                                    <strong>Join free beta</strong>
                                    <i class="fas fa-chevron-right"></i>
                                </template>
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
import axios from 'axios';
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
    name: 'BaseCardSubscribe',
    components: {},
})
export default class BaseCardSubscribe extends Vue {
    loading = false;
    isSuccess = false;
    error = '';
    email = '';

    @Prop() variant!: string;
    @Prop() border!: string;
    @Prop() button!: string;

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }

    async submit() {
        this.loading = true;

        try {
            await axios({
                url: process.env.VUE_APP_CMS_URL + '/form-contacts',
                method: 'POST',
                data: {
                    email: this.email,
                    message: `Beta signup! (${this.variant})`,
                },
            });
            this.isSuccess = true;
        } catch (e) {
            this.error = String(e);
        } finally {
            this.loading = false;
        }
        return;
    }
}
</script>
<style lang="scss" scoped>
.jumbotron .form-control {
    color: white;
}

.input-group-append {
    margin-left: -2px;
}
</style>
