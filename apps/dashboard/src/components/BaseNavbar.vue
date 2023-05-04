<template>
    <b-sidebar
        class="d-none d-md-flex"
        bg-variant="white"
        id="sidebar-left"
        no-header
        no-header-close
        no-close-on-route-change
        no-slide
        :visible="true"
    >
        <b-navbar toggleable="lg" class="sidebar">
            <div class="flex-grow-1 w-100 h-25 overflow-auto">
                <div class="d-flex px-3 justify-content-between pt-4 pb-4 text-center">
                    <router-link to="/" custom v-slot="{ navigate }" class="cursor-pointer">
                        <img
                            :src="require('../../public/assets/logo.png')"
                            width="40"
                            alt="THX logo"
                            @click="navigate"
                            @keypress.enter="navigate"
                            role="link"
                        />
                    </router-link>
                    <b-dropdown variant="light" class="" size="sm" no-caret right>
                        <template #button-content>
                            <div class="text-left d-flex align-items-center justify-content-between">
                                <div class="align-items-center d-flex">
                                    <img
                                        v-if="selectedPool"
                                        width="20"
                                        class="rounded"
                                        :src="
                                            selectedPool.brand && selectedPool.brand.logoImgUrl
                                                ? selectedPool.brand.logoImgUrl
                                                : `https://avatars.dicebear.com/api/identicon/${selectedPool._id}.svg`
                                        "
                                    />
                                    <b-spinner v-else variant="primary" small />
                                </div>
                            </div>
                        </template>
                        <b-dropdown-text class="text-muted small"> Loyalty Campaign </b-dropdown-text>
                        <b-dropdown-divider />
                        <b-dropdown-item-btn
                            class="small"
                            :key="key"
                            v-for="(p, key) of pools"
                            @click="onPoolSelect(p)"
                        >
                            <div class="text-left d-flex align-items-center justify-content-between">
                                <div class="align-items-center d-flex">
                                    <img
                                        width="20"
                                        class="mr-2 rounded"
                                        :src="
                                            p.brand && p.brand.logoImgUrl
                                                ? p.brand.logoImgUrl
                                                : `https://avatars.dicebear.com/api/identicon/${p._id}.svg`
                                        "
                                    />
                                    <span class="truncate-pool-title">
                                        {{ p.settings.title }}
                                    </span>
                                </div>
                                <i class="fas fa-caret-right ml-2"></i>
                            </div>
                        </b-dropdown-item-btn>
                    </b-dropdown>
                </div>
                <template v-if="selectedPool">
                    <base-navbar-nav :routes="configRoutes" />
                    <hr />
                    <label class="px-3 text-muted">Earn points</label>
                    <base-navbar-nav :routes="rewardRoutes" />
                    <hr />
                    <label class="px-3 text-muted">Shop perks</label>
                    <base-navbar-nav :routes="perkRoutes" />
                    <hr />
                </template>
                <label class="px-3 text-muted">Blockchain</label>
                <base-navbar-nav :routes="tokenRoutes" />
            </div>
            <div class="d-flex justify-content-end flex-column flex-grow-0 w-100 border-top py-2">
                <b-navbar-nav>
                    <b-nav-item to="/account" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <b-avatar size="sm" variant="light" :src="account.profileImg"></b-avatar>
                            </div>
                            <div class="flex-grow-1 align-items-center d-flex">
                                <span>Account</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/signout" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-sign-out-alt"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Logout</span>
                            </div>
                        </div>
                    </b-nav-item>
                </b-navbar-nav>
            </div>
        </b-navbar>
    </b-sidebar>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { plans } from '@thxnetwork/dashboard/utils/plans';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IAccount } from '../types/account';
import BaseNavbarNav from './BaseNavbarNav.vue';
import { TPool } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseNavbarNav,
    },
    computed: mapGetters({
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class BaseNavbar extends Vue {
    plans = plans;
    ERC20Type = ERC20Type;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    walletUrl = process.env.VUE_APP_WALLET_URL;
    pools!: IPools;
    account!: IAccount;

    get tokenRoutes() {
        return [
            {
                path: '/coins',
                label: 'Coins',
                iconClasses: 'fas fa-coins',
            },
            {
                path: '/nft',
                label: 'NFT',
                iconClasses: 'fas fa-palette',
            },
            {
                path: '/pools',
                label: 'Campaigns',
                iconClasses: 'fas fa-chart-pie',
            },
        ];
    }

    get rewardRoutes() {
        if (!this.selectedPool) return;
        return [
            {
                path: `/pool/${this.selectedPool._id}/daily`,
                label: 'Daily',
                iconClasses: 'fas fa-calendar',
            },
            {
                path: `/pool/${this.selectedPool._id}/referrals`,
                label: 'Referrals',
                iconClasses: 'fas fa-comments',
            },
            {
                path: `/pool/${this.selectedPool._id}/conditional`,
                label: 'Conditional',
                iconClasses: 'fas fa-trophy',
            },
            {
                path: `/pool/${this.selectedPool._id}/milestones`,
                label: 'Milestones',
                iconClasses: 'fas fa-flag',
            },
        ];
    }

    get perkRoutes() {
        if (!this.selectedPool) return;
        return [
            {
                path: `/pool/${this.selectedPool._id}/erc20-perks`,
                label: 'Coin',
                iconClasses: 'fas fa-coins',
            },
            {
                path: `/pool/${this.selectedPool._id}/erc721-perks`,
                label: 'NFT',
                iconClasses: 'fas fa-award',
            },
            {
                path: `/pool/${this.selectedPool._id}/shopify-perks`,
                label: 'Shopify',
                iconClasses: 'fas fa-shopping-basket',
            },
        ];
    }

    get configRoutes() {
        if (!this.selectedPool) return;
        const routes = [
            {
                path: `/pool/${this.selectedPool._id}/dashboard`,
                label: 'Dashboard',
                iconClasses: 'fas fa-chart-line',
            },
            {
                path: `/pool/${this.selectedPool._id}/settings`,
                label: 'Settings',
                iconClasses: 'fas fa-cog',
                isActive: this.selectedPool.widget ? this.selectedPool.widget.active : false,
            },
        ];

        return routes;
    }

    get firstPool() {
        const pools = Object.values(this.pools);
        if (!pools.length) return;
        return pools[0];
    }

    get selectedPool() {
        if (this.$route.params.id) {
            return this.pools[this.$route.params.id];
        } else {
            if (!this.firstPool) return;
            return this.firstPool;
        }
    }

    mounted() {
        this.$store.dispatch('pools/list', { archived: false }).then(async () => {
            if (this.$route.params.id) {
                await this.$store.dispatch('pools/read', this.$route.params.id);
            } else {
                if (!this.firstPool) return;
                await this.$store.dispatch('pools/read', this.firstPool._id);
            }
        });
    }

    async onPoolSelect(pool: TPool) {
        if (!pool.address) {
            await this.$store.dispatch('pools/read', pool._id);
        }
        this.$router.push({ path: `/pool/${pool._id}`, params: { id: pool._id } });
    }
}
</script>
<style>
.truncate-pool-title {
    text-overflow: ellipsis;
    display: block;
    width: 135px;
    overflow: hidden;
}
</style>
