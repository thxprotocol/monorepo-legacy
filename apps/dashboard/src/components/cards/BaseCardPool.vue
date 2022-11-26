<template>
    <base-card :loading="isLoading" :is-deploying="isDeploying">
        <template #card-header>
            <span v-if="pool.erc20 && pool.erc721">Token &amp; NFT Pool</span>
            <span v-if="pool.erc20 && !pool.erc721">Token Pool</span>
            <span v-if="!pool.erc20 && pool.erc721">Collectible Pool</span>
            <i class="ml-1 fas fa-archive text-white small" v-if="pool.archived"></i>
        </template>
        <template #card-body>
            <b-alert show variant="warning" v-if="outOfDate && artifacts">
                <i class="fas fa-exclamation-circle mr-2"></i>
                Please contact us in
                <b-link href="https://discord.com/invite/TzbbSmkE7Y" target="_blank"> Discord </b-link>
            </b-alert>
            <base-dropdown-menu-pool
                :pool="pool"
                @archive="archive"
                @remove="$bvModal.show(`modalDelete-${pool.address}`)"
            />
            <base-badge-network :chainId="pool.chainId" class="mr-1" />
            <p class="mt-3 mb-0" v-if="pool.erc20">
                <span class="text-muted">Balance:</span><br />
                <span class="font-weight-bold text-primary h3">
                    {{ fromWei(pool.erc20.poolBalance) }} {{ pool.erc20.symbol }}
                </span>
            </p>
            <p class="mt-3 mb-0" v-if="pool.erc721">
                <span class="text-muted">Minted NFTs:</span><br />
                <span class="font-weight-bold text-primary h3">
                    {{ pool.erc721.totalSupply }} {{ pool.erc721.symbol }}
                </span>
            </p>
            <base-modal-delete :id="`modalDelete-${pool.address}`" :call="() => remove()" :subject="pool.address" />
            <hr />
            <b-button class="rounded-pill" variant="primary" @click="openPoolUrl()" block>
                <i class="fas fa-cogs mr-2"></i>
                Configuration
            </b-button>
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
import { fromWei } from 'web3-utils';

@Component({
    components: {
        BaseDropdownMenuPool,
        BaseModalDelete,
        BaseBadgeNetwork,
        BaseCard,
    },
    computed: {
        ...mapState('account', ['version', 'artifacts']),
        ...mapGetters({
            profile: 'account/profile',
        }),
    },
})
export default class BaseCardPool extends Vue {
    warning = '';
    isLoading = true;
    isDeploying = false;
    fromWei = fromWei;

    @Prop() pool!: IPool;

    profile!: IAccount;
    artifacts!: string;

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

    async mounted() {
        await this.$store.dispatch('pools/read', this.pool._id);

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
            path: `pool/${this.pool._id}/${this.pool.erc20 ? 'erc20-rewards' : 'erc721-rewards'}`,
        });
    }

    async remove() {
        this.isLoading = true;
        await this.$store.dispatch('pools/remove', this.pool);
        this.isLoading = false;
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
