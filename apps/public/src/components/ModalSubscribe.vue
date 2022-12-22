<template>
    <b-modal :id="id" centered :title="title">
        <div class="d-flex align-items-center justify-content-center p-3" v-if="loading">
            <b-spinner variant="dark"></b-spinner>
        </div>
        <validation-observer v-else ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(submit)" id="modalSignupForm">
                <div class="row">
                    <div class="form-group col-md-6">
                        <validation-provider name="firstName" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-input
                                v-model="firstName"
                                type="text"
                                placeholder="First Name"
                                label="firstName"
                                :state="getValidationState(validationContext)"
                            />
                            <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                        </validation-provider>
                    </div>
                    <div class="form-group col-md-6">
                        <validation-provider name="lastName" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-input
                                v-model="lastName"
                                type="text"
                                placeholder="Last Name"
                                label="lastName"
                                :state="getValidationState(validationContext)"
                            />
                            <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                        </validation-provider>
                    </div>
                </div>
                <div class="form-group">
                    <validation-provider
                        name="email"
                        :rules="{ required: true, email: true }"
                        v-slot="validationContext"
                    >
                        <b-form-input
                            v-model="email"
                            type="email"
                            label="email"
                            placeholder="E-mail"
                            :state="getValidationState(validationContext)"
                        />
                        <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                    </validation-provider>
                </div>
            </b-form>
        </validation-observer>
        <template #modal-footer="{ cancel }">
            <b-button variant="secondary" @click="cancel()"> Cancel </b-button>
            <b-button variant="primary" type="submit" form="modalSignupForm"> Submit </b-button>
        </template>
    </b-modal>
</template>
<script lang="ts">
import axios from 'axios';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { BForm, BButton, BModal, BSpinner } from 'bootstrap-vue';
import { CMS_URL } from '../config/secrets';

@Component({
    name: 'ModalWaitList',
    components: {
        'b-spinner': BSpinner,
        'b-form': BForm,
        'b-button': BButton,
        'b-modal': BModal,
    },
})
export default class ModalWaitList extends Vue {
    loading = false;
    error = '';
    email = '';
    firstName = '';
    lastName = '';

    @Prop() id!: string;
    @Prop() title!: string;
    @Prop() type!: string;

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }

    async submit() {
        this.loading = true;

        try {
            await axios({
                url: CMS_URL + '/signups',
                method: 'POST',
                data: {
                    email: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    type: this.type,
                },
            });
            this.$bvModal.hide(this.id);
        } catch (e) {
            this.error = e.toString();
        } finally {
            this.loading = false;
        }
        return;
    }
}
</script>
