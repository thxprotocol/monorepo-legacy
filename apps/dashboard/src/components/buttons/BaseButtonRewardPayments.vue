<template>
    <b-link v-b-modal="`modalParticipants${reward._id}`">
        <b-spinner v-if="isLoading" small variant="primary" />
        <template v-else>
            <small><i class="fas text-muted fa-users mr-1" /></small>
            {{ payments.total }}/{{ reward.couponCodeCount || reward.limit || '&infin;' }}
        </template>
        <BaseModalParticipants :id="`modalParticipants${reward._id}`" :reward="reward" />
    </b-link>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TRewardPaymentState } from '../../store/modules/pools';
import BaseModalParticipants from '@thxnetwork/dashboard/components/modals/BaseModalParticipants.vue';

@Component({
    components: {
        BaseModalParticipants,
    },
    computed: mapGetters({
        paymentsList: 'pools/payments',
    }),
})
export default class BaseButtonRewardPayments extends Vue {
    isLoading = false;
    paymentsList!: TRewardPaymentState;

    @Prop() reward!: TReward;

    @Watch('reward')
    onQuestChange(reward: TReward) {
        this.getPayments(reward);
    }

    mounted() {
        this.getPayments(this.reward);
    }

    async getPayments(reward: TReward) {
        this.isLoading = true;
        await this.$store.dispatch('pools/listPayments', { reward, page: 1, limit: 25 });
        this.isLoading = false;
    }

    get payments() {
        if (!this.paymentsList[this.reward.poolId]) return { total: 0, results: [] };
        if (!this.paymentsList[this.reward.poolId][this.reward._id]) return { total: 0, results: [] };
        return this.paymentsList[this.reward.poolId][this.reward._id];
    }
}
</script>
