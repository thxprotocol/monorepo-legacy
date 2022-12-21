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
            <div class="w-100 pt-4 pb-4 text-center">
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
            </div>
            <div class="flex-grow-1 w-100 h-25 overflow-auto">
                <b-navbar-nav>
                    <b-nav-item to="/tokens" class="nav-link-plain" link-classes="nav-link-wrapper">
                        <div class="nav-link-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="flex-grow-1">
                            <span>Currencies</span>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/nft" class="nav-link-plain" link-classes="nav-link-wrapper">
                        <div class="nav-link-icon">
                            <i class="fas fa-palette"></i>
                        </div>
                        <div class="flex-grow-1">
                            <span class="mr-2">NFT</span>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/pools" class="nav-link-plain" link-classes="nav-link-wrapper">
                        <div class="nav-link-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="flex-grow-1">
                            <span>Loyalty Pools</span>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/partners" class="nav-link-plain mb-3" link-classes="nav-link-wrapper" disabled>
                        <div class="nav-link-icon">
                            <i class="fas fa-handshake"></i>
                        </div>
                        <div class="flex-grow-1">
                            <span>Partners</span>
                        </div>
                    </b-nav-item>
                </b-navbar-nav>
                <template v-if="selectedPool">
                    <hr class="m-0" />
                    <div class="w-100 p-3">
                        <label class="text-muted">Select loyalty pool:</label>
                        <b-dropdown variant="light" class="" block size="sm" no-caret menu-class="w-100">
                            <template #button-content>
                                <div class="text-left d-flex align-items-center justify-content-between">
                                    <div class="align-items-center d-flex">
                                        <img
                                            width="20"
                                            class="mr-2"
                                            :src="`https://avatars.dicebear.com/api/identicon/${selectedPool._id}.svg`"
                                        />
                                        {{ selectedPool._id.substring(0, 18) }}...
                                    </div>
                                    <i class="fas fa-caret-down"></i>
                                </div>
                            </template>
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
                                    <i class="fas fa-caret-right"></i>
                                </div>
                            </b-dropdown-item-btn>
                        </b-dropdown>
                    </div>
                    <b-navbar-nav>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/${route.path}`"
                            link-classes="nav-link-wrapper"
                            :key="key"
                            v-for="(route, key) of visibleRoutes"
                            class="nav-link-plain"
                        >
                            <div class="nav-link-icon">
                                <i :class="route.iconClasses"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>{{ route.label }}</span>
                            </div>
                        </b-nav-item>
                    </b-navbar-nav>
                </template>
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
                    <b-nav-item href="https://discord.com/invite/TzbbSmkE7Y" class="nav-link-plain">
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
import { AccountPlanType, type IAccount } from '@thxnetwork/dashboard/types/account';
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { plans } from '@thxnetwork/dashboard/utils/plans';
import { getRoutes } from '@thxnetwork/dashboard/utils/routes';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
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
    // selectedPool: IPool | null = null;
    pools!: IPools;
    account!: IAccount;

    get visibleRoutes() {
        if (!this.selectedPool) return;
        return getRoutes(this.selectedPool, this.account.plan === AccountPlanType.Premium);
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
        this.$router.push({ path: `/pool/${pool._id}/transactions`, params: { id: pool._id } });
    }
}
</script>
