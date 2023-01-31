<template>
    <base-card
        :is-loading="isLoading"
        :body-bg-variant="pool.archived ? 'light' : null"
        :is-deploying="isDeploying"
        @click="openPoolUrl()"
        class="cursor-pointer"
    >
        <template #card-header>
            <div v-if="!isLoading">
                <b-alert show variant="warning" v-if="outOfDate && artifacts">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Please contact us in
                    <b-link href="https://discord.com/invite/TzbbSmkE7Y" target="_blank"> Discord </b-link>
                </b-alert>

                <base-badge-network :chainId="pool.chainId" class="mr-1" />
            </div>
            <base-dropdown-menu-pool
                class="ml-auto"
                :pool="pool"
                @archive="archive"
                @remove="$bvModal.show(`modalDelete-${pool._id}`)"
                @edit="$bvModal.show(`modalAssetPoolEdit-${pool._id}`)"
            />
        </template>
        <template #card-body>
            <p class="text-muted">
                {{ pool.title }}
            </p>
            <hr />
            <b-container class="mb-0 text-center text-gray">
                <b-row class="pb-2">
                    <b-col>
                        <strong class="text-primary" style="font-size: 1.3rem">
                            {{
                                (metrics.referralRewards ? metrics.referralRewards.totalClaimPoints : 0) +
                                (metrics.pointRewards ? metrics.pointRewards.totalClaimPoints : 0)
                            }}
                        </strong>
                        <div class="small">Points Claimed</div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <strong class="text-primary">{{ metrics.erc20Perks ? metrics.erc20Perks.payments : 0 }}</strong>
                        <div class="small">Coin Perks Redeemed</div>
                    </b-col>
                    <b-col>
                        <strong class="text-primary">{{
                            metrics.erc721Perks ? metrics.erc721Perks.payments : 0
                        }}</strong>
                        <div class="small">NFT Perks Redeemed</div>
                    </b-col>
                </b-row>
            </b-container>
            <base-modal-delete
                :id="`modalDelete-${pool._id}`"
                @submit="remove(pool._id)"
                :error="error"
                :subject="pool._id"
            />
            <base-modal-pool-create :id="`modalAssetPoolEdit-${pool._id}`" :pool="pool" />
        </template>
    </base-card>
</template>

<script lang="ts">
import type { IAccount } from '@thxnetwork/dashboard/types/account';
import type { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseCard from '@thxnetwork/dashboard/components/cards/BaseCard.vue';
import promisePoller from 'promise-poller';
import BaseDropdownMenuPool from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownMenuPool.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { fromWei } from 'web3-utils';
import { IPoolAnalyticsMetrics } from '../../store/modules/pools';

@Component({
    components: {
        BaseModalPoolCreate,
        BaseDropdownMenuPool,
        BaseModalDelete,
        BaseBadgeNetwork,
        BaseCard,
    },
    computed: {
        ...mapState('account', ['version', 'artifacts']),
        ...mapGetters({
            profile: 'account/profile',
            analyticsMetrics: 'pools/analyticsMetrics',
        }),
    },
})
export default class BaseCardPool extends Vue {
    warning = '';
    error = '';
    isLoading = true;
    isDeploying = false;
    fromWei = fromWei;

    @Prop() pool!: IPool;

    profile!: IAccount;
    artifacts!: string;
    analyticsMetrics!: IPoolAnalyticsMetrics;

    get outOfDate() {
        return this.pool.version !== this.artifacts;
    }

    get variant() {
        switch (this.pool.variant) {
            default:
                return 'Default';
            case 'defaultPool':
                return 'Default';
            case 'nftPool':
                return 'NFT';
        }
    }

    get metrics() {
        if (!this.analyticsMetrics[this.pool._id]) {
            return null;
        }
        return this.analyticsMetrics[this.pool._id];
    }

    async mounted() {
        await this.$store.dispatch('pools/read', this.pool._id);
        await this.$store.dispatch('pools/readAnalyticsMetrics', { poolId: this.pool._id });

        if (!this.pool.address) {
            this.isDeploying = true;
            this.waitForAddress();
        } else {
            this.isDeploying = false;
            this.isLoading = false;
        }
    }

    waitForAddress() {
        const taskFn = async () => {
            const pool = await this.$store.dispatch('pools/read', this.pool._id);
            if (pool.address.length) {
                this.isDeploying = false;
                this.isLoading = false;
                return Promise.resolve(pool);
            } else {
                this.isLoading = false;
                return Promise.reject(pool);
            }
        };

        promisePoller({
            taskFn,
            interval: 3000,
            retries: 10,
        });
    }

    openPoolUrl() {
        this.$router.push({
            path: `pool/${this.pool._id}`,
        });
    }

    async remove(_id: string) {
        try {
            this.isLoading = true;
            await this.$store.dispatch('pools/remove', { _id });
        } catch (error) {
            this.error = error as string;
        } finally {
            this.isLoading = false;
        }
    }

    async archive() {
        this.isLoading = true;
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { archived: !this.pool.archived },
        });
        this.isLoading = false;
    }
}
</script>
