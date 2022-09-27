<template>
    <div class="container container-md pt-10" v-if="pool">
        <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center justify-content-between w-100">
                <h1 v-if="pool.erc20" class="mr-3">{{ fromWei(pool.erc20.poolBalance) }} {{ pool.erc20.symbol }}</h1>
                <h1 v-if="pool.erc721" class="mr-3">{{ pool.erc721.totalSupply }} {{ pool.erc721.symbol }}</h1>
                <base-badge-network :chainId="pool.chainId" class="ml-md-auto" />
            </div>
            <div class="d-flex">
                <b-dropdown size="sm" no-caret variant="link" dropleft class="d-flex ml-2 d-md-none">
                    <template #button-content>
                        <i class="fas fa-ellipsis-v text-muted ml-0" style="font-size: 1.2rem"></i>
                    </template>
                    <b-dropdown-item
                        :key="key"
                        v-for="(route, key) of visibleRoutes"
                        :to="`/pool/${pool._id}/${route.path}`"
                        class="nav-link-wrapper"
                    >
                        <i :class="route.iconClasses" class="ml-0 text-gray" style="width: 30px"></i>
                        {{ route.label }}
                    </b-dropdown-item>
                </b-dropdown>
            </div>
        </div>
        <div v-if="pool.erc20" class="d-flex">
            <span class="lead">
                {{ pool.erc20.name }}
            </span>
            <b-button
                size="sm"
                variant="link"
                class="rounded-pill pl-3 ml-2"
                v-b-modal="`modalDepositCreate-${pool.erc20._id}`"
            >
                Top up
                <i class="fas fa-arrow-down ml-1 mr-1"></i>
            </b-button>
        </div>
        <div v-if="pool.erc721">
            <span class="lead">
                {{ pool.erc721.name }}
            </span>
            <b-badge variant="dark" class="ml-1">NFT</b-badge>
        </div>
        <hr />
        <router-view></router-view>
        <base-modal-deposit-create
            v-if="pool.erc20"
            @submit="$store.dispatch('erc20/read', pool.erc20._id)"
            :pool="pool"
        />
    </div>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { getRoutes } from '@thxnetwork/dashboard/utils/routes';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import BaseBadgeNetwork from '@thxnetwork/dashboard/components/badges/BaseBadgeNetwork.vue';
import BaseModalDepositCreate from '@thxnetwork/dashboard/components/modals/BaseModalDepositCreate.vue';
import { fromWei } from 'web3-utils';

@Component({
    components: {
        BaseModalDepositCreate,
        BaseBadgeNetwork,
    },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class AssetPoolView extends Vue {
    chainId: ChainId = ChainId.PolygonMumbai;
    pools!: IPools;
    ERC20Type = ERC20Type;
    fromWei = fromWei;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('pools/read', this.$route.params.id).then(() => {
            this.chainId = this.pool.chainId;
        });
    }

    get visibleRoutes() {
        return getRoutes(this.pool);
    }
}
</script>
