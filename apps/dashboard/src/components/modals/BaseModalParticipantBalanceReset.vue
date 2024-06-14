<template>
    <BaseModal :id="id" title="Reset participant balances">
        <template #modal-body>
            <b-alert variant="danger" show v-if="error">
                <i class="fas fa-exclamation-circle mr-2" />
                {{ error }}
            </b-alert>
            <p>This action will reset the point balance for all campaign participants. Are you sure?</p>
            <b-form-group class="mb-0">
                <template #label> Please, type "reset" to confirm the action </template>
                <b-form-input v-model="checkReset" placeholder="reset" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button
                @click="onClickParticipantsReset"
                block
                class="rounded-pill"
                variant="danger"
                :disabled="isDisabled"
            >
                <b-spinner v-if="isLoading" small />
                <template v-else>Reset balances</template>
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
export default class BaseModalParticipantBalanceReset extends Vue {
    isLoading = false;
    error = '';
    checkReset = '';
    id = 'BaseModalParticipantBalanceReset';

    @Prop() pool!: TPool;

    get isDisabled() {
        return this.checkReset !== 'reset';
    }

    async onClickParticipantsReset() {
        try {
            this.isLoading = true;
            await this.$store.dispatch('pools/resetParticipants', this.pool);
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
