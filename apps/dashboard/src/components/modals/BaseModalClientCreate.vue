<template>
    <base-modal @hidden="onClose" :error="error" :title="modalName" id="modalClientCreate">
        <template #modal-body>
            <form v-on:submit.prevent="submit" id="formClientCreate">
                <b-card bg-variant="light" class="border-0" body-class="p-5">
                    <b-row class="mb-2">
                        <b-col>
                            <b-form-group>
                                <label>Name</label>
                                <b-form-input v-model="name" />
                            </b-form-group>
                        </b-col>
                    </b-row>
                    <b-row class="mb-2">
                        <b-col>
                            <label> Grant Type</label>
                            <b-select :disabled="isEditing" v-model="grantType">
                                <b-select-option value="authorization_code">Authorization Code</b-select-option>
                                <b-select-option value="client_credentials">Client Credentials</b-select-option>
                            </b-select>
                        </b-col>
                    </b-row>
                    <b-row v-if="grantType === 'authorization_code'">
                        <b-col>
                            <b-form-group>
                                <label>Redirect URI</label>
                                <b-form-input
                                    v-model="redirectUri"
                                    placeholder="https://example.com/redirect-callback"
                                    :disabled="isEditing"
                                />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group>
                                <label>Request URI</label>
                                <b-form-input
                                    v-model="requestUri"
                                    placeholder="https://example.com"
                                    :disabled="isEditing"
                                />
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-card>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="!isValid"
                type="submit"
                form="formClientCreate"
                variant="primary"
                block
                class="rounded-pill"
            >
                Submit
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { TClient } from '@thxprotocol/dashboard/store/modules/clients';
import { IPool } from '@thxprotocol/dashboard/store/modules/pools';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';

type GrantType = 'authorization_code' | 'client_credentials';

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalClientCreate extends Vue {
    @Prop() pool!: IPool;
    @Prop() page!: number;
    @Prop() client: TClient | undefined;

    error = '';
    name = '';
    grantType: GrantType = 'client_credentials';
    redirectUri = '';
    requestUri = '';

    get modalName() {
        return this.isEditing ? 'Update Client' : 'Create Client';
    }

    get isValid() {
        return this.grantType === 'authorization_code' ? this.redirectUri !== '' && this.requestUri !== '' : true;
    }

    get isEditing() {
        return !!this.client;
    }

    @Watch('client')
    onClientChange(client: TClient) {
        if (!client) return;
        this.name = client.name;
        this.grantType = client.grantType as GrantType;
    }

    reset() {
        this.name = '';
        this.grantType = 'client_credentials';
        this.redirectUri = '';
        this.requestUri = '';
    }

    onClose() {
        this.reset();
        this.$emit('hidden');
    }

    async submit() {
        if (this.client) {
            await this.$store.dispatch('clients/update', {
                ...this.client,
                name: this.name,
                pool: this.pool,
            });
        } else {
            await this.$store.dispatch('clients/create', {
                name: this.name,
                pool: this.pool,
                grantType: this.grantType,
                redirectUri: this.redirectUri,
                requestUri: this.requestUri,
            });
        }

        this.$emit('submit');
        this.reset();
        this.$bvModal.hide(`modalClientCreate`);
    }
}
</script>
