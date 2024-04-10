<template>
    <div class="container-md container-pool">
        <template v-if="pool">
            <b-alert variant="primary" show v-if="pool.trialEndsAt">
                <i class="fas fa-clock mr-2"></i>
                Your campaign trial {{ isTrialEnd ? 'ended' : 'ends' }}
                {{ formatDistanceToNow(new Date(pool.trialEndsAt), { addSuffix: true }) }}.
                <b-link v-b-modal="'modalCreatePayment'">Make a payment to continue using the service</b-link>.
            </b-alert>
            <router-view></router-view>
        </template>
        <BaseModalPaymentCreate id="modalCreatePayment" :pool="pool" />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { fromWei } from 'web3-utils';
import { formatDistanceToNow, isFuture } from 'date-fns';
import BaseModalPaymentCreate from '../components/modals/BaseModalPaymentCreate.vue';

@Component({
    components: {
        BaseModalPaymentCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class PoolView extends Vue {
    account!: TAccount;
    pools!: IPools;
    ERC20Type = ERC20Type;
    fromWei = fromWei;
    formatDistanceToNow = formatDistanceToNow;
    isFuture = isFuture;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isTrialEnd() {
        return this.pool.trialEndsAt && !isFuture(new Date(this.pool.trialEndsAt));
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('pools/read', this.$route.params.id);

        if (this.isTrialEnd) {
            this.$bvModal.show('modalCreatePayment');
        }
    }
}
</script>

<style>
.container-pool {
    padding-top: 35px !important;
}
</style>
