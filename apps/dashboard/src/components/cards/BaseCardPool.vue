<template>
    <base-card
        :is-loading="isLoading"
        :body-bg-variant="pool.settings.isArchived ? 'light' : null"
        :is-deploying="isDeploying"
        @click="openPoolUrl()"
        class="cursor-pointer"
    >
        <template #card-header>
            <div v-if="!isLoading">
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
            <b-alert show variant="warning" v-if="outOfDate && artifacts">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Campaign out of date! Please start a support chat.
            </b-alert>
            <p class="text-muted">
                {{ pool.settings.title }}
            </p>
            <b-input-group size="sm">
                <b-input-group-prepend class="px-2">
                    <img width="20" :src="`https://api.dicebear.com/7.x/identicon/svg?seed=${pool._id}`" />
                </b-input-group-prepend>
                <b-form-input size="sm" readonly :value="pool.address" />
                <b-input-group-append>
                    <b-button variant="primary" @click.stop="onClickCopy" style="white-space: normal" size="sm">
                        <i class="fas ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
            <base-modal-delete
                :id="`modalDelete-${pool._id}`"
                @submit="remove(pool._id)"
                :error="error"
                :subject="pool._id"
            />
            <base-modal-pool-create :id="`modalAssetPoolEdit-${pool._id}`" />
        </template>
    </base-card>
</template>

<script lang="ts">
import type { TAccount, TPool } from '@thxnetwork/types/interfaces';
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
    $clipboard!: unknown;
    warning = '';
    error = '';
    isCopied = false;
    isLoading = true;
    isDeploying = false;
    fromWei = fromWei;

    @Prop() pool!: TPool;

    profile!: TAccount;
    artifacts!: string;
    analyticsMetrics!: IPoolAnalyticsMetrics;

    get outOfDate() {
        return this.pool.version !== this.artifacts;
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

    onClickCopy() {
        this.$copyText(this.pool.address);
        this.isCopied = true;
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
            data: { archived: !this.pool.settings.isArchived },
        });
        this.isLoading = false;
    }
}
</script>
