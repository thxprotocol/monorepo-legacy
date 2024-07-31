<template>
    <div class="d-flex h-100 flex-row">
        <BaseNavbar />
        <div style="overflow-y: auto" class="flex-grow-1">
            <div class="container-md pt-3">
                <template v-if="pool">
                    <b-alert variant="primary" show v-if="pool.trialEndsAt">
                        <i class="fas fa-clock mr-2"></i>
                        Your campaign trial {{ isTrialEnd ? 'ended' : 'ends' }}
                        {{ formatDistanceToNow(new Date(pool.trialEndsAt), { addSuffix: true }) }}.
                        <b-link v-b-modal="'modalCreatePayment'">Make a payment to continue using the service</b-link>.
                    </b-alert>
                    <router-view :pool="pool" />
                </template>
                <BaseModalPaymentCreate id="modalCreatePayment" :pool="pool" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { fromWei } from 'web3-utils';
import { formatDistanceToNow, isFuture } from 'date-fns';
import BaseModalPaymentCreate from '@thxnetwork/dashboard/components/modals/BaseModalPaymentCreate.vue';
import { BigNumber } from 'ethers';
import BaseNavbar from '@thxnetwork/dashboard/components/BaseNavbar.vue';

@Component({
    components: {
        BaseNavbar,
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
        return this.pool && this.pool.trialEndsAt && !isFuture(new Date(this.pool.trialEndsAt));
    }

    @Watch('pool.balance')
    assertPayment() {
        if (this.isTrialEnd && BigNumber.from(this.pool.balance).eq(0)) {
            this.$bvModal.show('modalCreatePayment');
        }
    }

    async mounted() {
        await this.$store.dispatch('pools/read', this.$route.params.id);
    }
}
</script>

<style>
.container-pool {
    padding-top: 35px !important;
}
</style>
