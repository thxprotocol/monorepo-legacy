<template>
    <b-sidebar
        class="d-none d-md-flex"
        bg-variant="darker"
        id="sidebar-left"
        no-header
        no-header-close
        no-close-on-route-change
        no-slide
        :visible="true"
        shadow
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
                    <b-nav-item to="/tokens" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-coins"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Tokens</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/nft" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-palette"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span class="mr-2">NFT</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/pools" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-chart-pie"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span class="mr-2">Pools</span>
                                <small v-if="pool" class="text-truncate w-10 m-0">{{ pool.address }}</small>
                            </div>
                        </div>
                        <div v-if="pool" class="bg-dark p-0">
                            <b-nav-item
                                :to="`/pool/${pool._id}/${route.path}`"
                                class="nav-link-plain"
                                link-classes="nav-link-wrapper"
                                :key="key"
                                v-for="(route, key) of visibleRoutes"
                            >
                                <div class="nav-link-icon text-center">
                                    <i :class="route.iconClasses"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <span>{{ route.label }}</span>
                                </div>
                            </b-nav-item>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/integrations" class="nav-link-plain">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Integrations</span>
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
                </b-navbar-nav>
            </div>
            <div class="d-flex justify-content-end flex-column flex-grow-0 w-100">
                <b-navbar-nav>
                    <b-nav-item class="nav-link-plain border-top border-dark" v-if="profile">
                        <div class="nav-link-wrapper">
                            <div class="flex-grow-1">
                                <b-badge variant="dark">{{ plans[profile.plan].name }}</b-badge
                                ><br />
                                <small class="text-muted" v-html="plans[profile.plan].text" />
                            </div>
                            <div class="d-flex align-items-center">
                                <b-button size="sm" variant="dark" disabled href="https://docs.thx.network/pricing">
                                    Upgrade
                                </b-button>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/account" class="nav-link-plain border-top border-dark">
                        <div class="nav-link-wrapper">
                            <div class="nav-link-icon">
                                <i class="fa fa-gear"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span>Account</span>
                            </div>
                        </div>
                    </b-nav-item>
                    <b-nav-item to="/signout" class="nav-link-plain border-top border-dark">
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
import { IPools } from '@thxprotocol/dashboard/store/modules/pools';
import { IAccount } from '@thxprotocol/dashboard/types/account';
import { ERC20Type } from '@thxprotocol/dashboard/types/erc20';
import { plans } from '@thxprotocol/dashboard/utils/plans';
import { getRoutes } from '@thxprotocol/dashboard/utils/routes';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class BaseNavbar extends Vue {
    plans = plans;
    ERC20Type = ERC20Type;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    walletUrl = process.env.VUE_APP_WALLET_URL;
    pools!: IPools;
    profile!: IAccount;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get visibleRoutes() {
        return getRoutes(this.pool);
    }
}
</script>

<style scoped lang="scss">
.sidebar .nav-link-plain {
    .nav-link {
        padding: 0rem;
        margin: 0;
    }

    .nav-link-wrapper {
        padding: 0.7rem 1rem;
        display: flex;
        transition: 0.2s background-color ease;

        &:hover {
            background-color: #211359;
        }
    }

    .nav-link-icon {
        width: 30px;
        flex: 0 0 30px;

        ~ div {
            flex-grow: 1;
        }
    }

    .nav-link-plain {
        .nav-link {
            padding: 0.7rem 1rem;
        }
        border-bottom: 1px solid black;
    }
}
</style>
