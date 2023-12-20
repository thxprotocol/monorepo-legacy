<template>
    <base-modal
        @show="onShow"
        @hidden="$emit('hidden')"
        :error="error"
        :title="`${client ? 'Update' : 'Create'} API Key`"
        :id="id"
    >
        <template #modal-body>
            <form v-on:submit.prevent="submit" id="formClientCreate">
                <b-form-group label="Name">
                    <b-form-input v-model="name" />
                </b-form-group>
                <b-form-group label="Grant Type">
                    <b-select v-model="grantType" :disabled="!!client">
                        <b-select-option value="client_credentials">Client Credentials</b-select-option>
                        <b-select-option value="authorization_code">Authorization Code</b-select-option>
                    </b-select>
                </b-form-group>
                <template v-if="grantType === 'authorization_code'">
                    <b-form-group>
                        <label>Redirect URI</label>
                        <b-form-input v-model="redirectUri" placeholder="https://example.com/redirect-callback" />
                    </b-form-group>
                </template>
            </form>
        </template>
        <template #btn-primary>
            <b-button type="submit" form="formClientCreate" variant="primary" block class="rounded-pill">
                {{ client ? 'Update' : 'Create' }} API Key
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import type { TClient, TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import { GrantVariant } from '@thxnetwork/types/enums';

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalClientCreate extends Vue {
    error = '';
    name = '';
    grantType: GrantVariant = GrantVariant.ClientCredentials;
    redirectUri = '';
    requestUri = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop() client!: TClient;

    get isValid() {
        if (this.grantType === GrantVariant.ClientCredentials) return;
        return !this.redirectUri.length && !this.requestUri.length;
    }

    onShow() {
        this.name = this.client ? this.client.name : this.name;
        this.grantType = this.client ? this.client.grantType : this.grantType;
        this.redirectUri = this.client ? this.client.redirectUri : this.redirectUri;
        this.requestUri = this.client ? this.client.requestUri : this.requestUri;
    }

    async submit() {
        const action = this.client ? 'update' : 'create';
        await this.$store.dispatch('clients/' + action, {
            pool: this.pool,
            payload: {
                ...this.client,
                name: this.name,
                grantType: this.grantType,
                redirectUri: this.redirectUri,
                requestUri: this.requestUri,
            },
        });
        this.$emit('submit');
        this.$bvModal.hide(this.id);
    }
}
</script>
