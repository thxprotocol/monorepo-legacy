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
                <BaseFormGroup required label="Name" tooltip="Use a name to identify how your client is used.">
                    <b-form-input v-model="name" />
                </BaseFormGroup>
                <BaseFormGroup
                    required
                    label="Grant Type"
                    tooltip="Choose a grant type for the client that is used by your application"
                >
                    <b-select v-model="grantType" :disabled="!!client">
                        <b-select-option value="client_credentials">Client Credentials (backend)</b-select-option>
                        <b-select-option value="authorization_code">Authorization Code (frontend)</b-select-option>
                    </b-select>
                </BaseFormGroup>
                <template v-if="grantType === 'authorization_code'">
                    <BaseFormGroup
                        required
                        label="Redirect URI"
                        tooltip="The authorization server will redirect your user to this location with the authorization code in the URL search parameters. Use it to request your access token."
                    >
                        <b-form-input v-model="redirectUri" placeholder="https://example.com/redirect-callback" />
                    </BaseFormGroup>
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
import BaseModal from './BaseModal.vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { GrantVariant } from '@thxnetwork/common/enums';

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalClientCreate extends Vue {
    isLoading = false;
    error = '';
    name = '';
    grantType: GrantVariant = GrantVariant.ClientCredentials;
    redirectUri = '';
    requestUri = '';

    @Prop() id!: string;
    @Prop() client!: TClient;

    get isValid() {
        if (this.grantType === GrantVariant.ClientCredentials) return;
        return !this.redirectUri.length && !this.requestUri.length;
    }

    get isDisabled() {
        return !this.isValid || this.isLoading;
    }

    onShow() {
        this.name = this.client ? this.client.name : this.name;
        this.grantType = this.client ? this.client.grantType : this.grantType;
        this.redirectUri = this.client ? this.client.redirectUri : this.redirectUri;
        this.requestUri = this.client ? this.client.requestUri : this.requestUri;
    }

    async submit() {
        this.isLoading = true;
        const action = this.client ? 'updateClient' : 'createClient';
        await this.$store.dispatch('developer/' + action, {
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
        this.isLoading = false;
    }
}
</script>
