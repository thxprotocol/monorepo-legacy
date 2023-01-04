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
                <template v-if="selectedPool">
                    <div class="d-flex px-3 justify-content-between pt-4 pb-4 text-center">
                        <router-link to="/" custom v-slot="{ navigate }">
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
                                            width="20"
                                            :src="`https://avatars.dicebear.com/api/identicon/${selectedPool._id}.svg`"
                                        />
                                    </div>
                                </div>
                            </template>
                            <b-dropdown-text class="text-muted small"> Loyalty Pools </b-dropdown-text>
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
                                            class="mr-2"
                                            :src="`https://avatars.dicebear.com/api/identicon/${p._id}.svg`"
                                        />
                                        {{ p._id.substring(0, 18) }}...
                                    </div>
                                    <i class="fas fa-caret-right ml-2"></i>
                                </div>
                            </b-dropdown-item-btn>
                        </b-dropdown>
                    </div>
                    <base-navbar-nav :selectedPool="selectedPool" :routes="configRoutes" />
                    <hr />
                    <label class="px-3 text-muted">Rewards</label>
                    <base-navbar-nav :selectedPool="selectedPool" :routes="rewardRoutes" />
                    <hr />
                    <label class="px-3 text-muted">Perks</label>
                    <base-navbar-nav :selectedPool="selectedPool" :routes="perkRoutes" />
                </template>
                <hr />
                <label class="px-3 text-muted">Tokens</label>
                <base-navbar-nav :selectedPool="selectedPool" :routes="tokenRoutes" />
            </div>
            <div class="d-flex justify-content-end flex-column flex-grow-0 w-100">
                <b-navbar-nav>
                    <b-nav-item class="nav-link-plain" v-if="account">
                        <div class="nav-link-wrapper">
                            <div class="flex-grow-1">
                                <b-badge variant="dark">{{ plans[account.plan].name }}</b-badge>
                                <br />
                                <small class="text-muted" v-html="plans[account.plan].text" />
                            </div>
                            <div class="d-flex align-items-center">
                                <b-button size="sm" variant="darker" disabled href="https://docs.thx.network/pricing">
                                    Upgrade
                                </b-button>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item :href="docsUrl" target="_blank" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="far fa-file-alt"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Documentation</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/account" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fa fa-gear"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Account</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item href="https://discord.com/invite/TzbbSmkE7Y" target="_blank" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-question"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Support</span>
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
import { IPool, IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { plans } from '@thxnetwork/dashboard/utils/plans';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccountPlanType, IAccount } from '../types/account';
import BaseNavbarNav from './BaseNavbarNav.vue';

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
        if (!this.selectedPool) return;
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
                label: 'Pools',
                iconClasses: 'fas fa-chart-pie',
            },
        ];
    }

    get rewardRoutes() {
        if (!this.selectedPool) return;
        return [
            {
                path: `/pool/${this.selectedPool._id}/referrals`,
                label: 'Referrals',
                iconClasses: 'fas fa-comments',
            },
            {
                path: `/pool/${this.selectedPool._id}/points`,
                label: 'Conditional',
                iconClasses: 'fas fa-trophy',
            },
            {
                path: `/pool/${this.selectedPool._id}/milestones`,
                label: 'Milestones',
                iconClasses: 'fas fa-flag',
                isSoon: true,
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
        ];
    }

    get configRoutes() {
        if (!this.selectedPool) return;
        return [
            {
                path: `/pool/${this.selectedPool._id}/dashboard`,
                label: 'Dashboard',
                iconClasses: 'fas fa-chart-line',
            },
            {
                path: `/pool/${this.selectedPool._id}/widget`,
                label: 'Widget',
                iconClasses: 'fas fa-code',
                isNew: true,
            },
            {
                path: `/pool/${this.selectedPool._id}/metadata`,
                label: 'Metadata',
                iconClasses: 'fas fa-palette',
            },
            {
                path: `/pool/${this.selectedPool._id}/clients`,
                label: 'Clients',
                iconClasses: 'fas fa-key',
                isPremium: true,
            },
            {
                path: `/pool/${this.selectedPool._id}/settings`,
                label: 'Settings',
                iconClasses: 'fas fa-cog',
            },
        ];
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

    async onPoolSelect(pool: IPool) {
        if (!pool.address) {
            await this.$store.dispatch('pools/read', pool._id);
        }
        this.$router.push({ path: `/pool/${pool._id}`, params: { id: pool._id } });
    }
}
</script>
