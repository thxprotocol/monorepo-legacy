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

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalClientCreate extends Vue {
    isLoading = false;
    error = '';
    name = '';

    @Prop() id!: string;
    @Prop() client!: TClient;

    get isDisabled() {
        return this.isLoading;
    }

    onShow() {
        this.name = this.client ? this.client.name : this.name;
    }

    async submit() {
        this.isLoading = true;
        const action = this.client ? 'updateClient' : 'createClient';
        await this.$store.dispatch('developer/' + action, {
            payload: {
                ...this.client,
                name: this.name,
            },
        });
        this.$emit('submit');
        this.$bvModal.hide(this.id);
        this.isLoading = false;
    }
}
</script>
