<template>
    <BaseModal @show="onShow" :id="id" title="Export participant list">
        <template #modal-body>
            <b-alert variant="danger" show v-if="error">
                <i class="fas fa-exclamation-circle mr-2" />
                {{ error }}
            </b-alert>
            <p>This action will create a CSV containing detailed information about your campaign participants.</p>
        </template>
        <template #btn-primary>
            <b-button @click="onClick" block class="rounded-pill" variant="primary" :disabled="isDisabled">
                <b-spinner v-if="isLoading" small />
                <template v-else>Download CSV</template>
            </b-button>
        </template>
    </BaseModal>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalParticipantExport extends Vue {
    isLoading = false;
    error = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;

    get isDisabled() {
        return this.isLoading;
    }

    onShow() {
        this.error = '';
    }

    async onClick() {
        try {
            this.isLoading = true;
            await this.$store.dispatch('pools/exportParticipants', this.pool);
            this.$emit('hidden');
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
