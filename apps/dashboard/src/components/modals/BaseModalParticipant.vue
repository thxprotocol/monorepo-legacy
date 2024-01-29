<template>
    <base-modal size="xl" :title="`Update Participant`" :id="id" :error="error" @show="onShow">
        <template #modal-body>
            <b-form-group label="Point Balance">
                <b-form-input min="0" type="number" :state="isPointBalanceValid" v-model="pointBalance" />
            </b-form-group>
        </template>
        <template #btn-primary>
            <b-button :disabled="isDisabled" class="rounded-pill" @click="onUpdate" variant="primary" block>
                <b-spinner v-if="isLoading" small />
                <template v-else> Update </template>
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TParticipant } from '@thxnetwork/common/lib/types';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';

@Component({
    components: {
        BaseModal,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseModalParticipant extends Vue {
    isLoading = false;
    pointBalance = 0;
    error = '';

    @Prop() id!: string;
    @Prop() participant!: TParticipant;

    onShow() {
        this.pointBalance = this.participant.pointBalance;
    }

    get isPointBalanceValid() {
        return this.pointBalance >= 0;
    }

    get isDisabled() {
        return !this.isPointBalanceValid || this.isLoading;
    }

    async onUpdate() {
        try {
            if (!this.isPointBalanceValid) {
                throw new Error('Please provide a point balance greater than or equal to 0');
            }
            this.isLoading = true;
            await this.$store.dispatch('pools/updateParticipant', {
                ...this.participant,
                pointBalance: this.pointBalance >= 0 ? this.pointBalance : 0,
            });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
