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
            <div class="flex-grow-1 w-100 h-25 overflow-auto d-flex justify-content-end flex-column">
                <b-link v-if="selectedPool" :to="`/pool/${selectedPool._id}/settings`" class="mx-auto mt-3">
                    <img
                        style="max-height: 50px; max-width: 120px"
                        :src="
                            selectedPool.brand && selectedPool.brand.logoImgUrl
                                ? selectedPool.brand.logoImgUrl
                                : `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedPool._id}`
                        "
                    />
                </b-link>
                <b-dropdown
                    split
                    split-class="pr-2"
                    size="sm"
                    variant="light"
                    right
                    class="my-3 d-flex btn-toggle-campaign"
                    @click="onClickPreview"
                >
                    <template #button-content>
                        <div class="d-flex" v-b-tooltip.top.hover title="Preview campaign">
                            <template v-if="selectedPool">
                                <div class="truncate-pool-title text-muted flex-grow-1 pl-2">
                                    {{ selectedPool.settings.title }}
                                </div>
                                <div class="flex-grow-0">
                                    <i class="fas fa-external-link-alt text-muted" />
                                </div>
                            </template>
                            <b-spinner v-else variant="primary" small />
                        </div>
                    </template>
                    <div style="max-height: 300px; overflow: auto">
                        <b-dropdown-item-btn
                            class="small"
                            :key="key"
                            v-for="(p, key) of pools"
                            @click="onPoolSelect(p)"
                        >
                            <div class="text-left d-flex align-items-center justify-content-between">
                                <div class="align-items-center d-flex">
                                    <span class="truncate-pool-title">
                                        {{ p.settings.title }}
                                    </span>
                                    <i class="fas fa-caret-right text-muted ml-2"></i>
                                </div>
                            </div>
                        </b-dropdown-item-btn>
                    </div>
                </b-dropdown>
                <template v-if="selectedPool">
                    <b-navbar-nav class="py-0">
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/dashboard`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Analytics</span>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/quests`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-trophy"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Quests</span>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/rewards`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-gift"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Rewards</span>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/participants`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Participants</span>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/integrations`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                            :disabled="!hasBasicAccess(selectedPool.owner)"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-exchange-alt"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Integrations</span>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/developer`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-code"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Developer</span>
                                    <div
                                        v-if="selectedPool.widget ? !selectedPool.widget.active : false"
                                        variant="gray"
                                        class="mr-3"
                                    >
                                        <i class="fas fa-exclamation text-danger"></i>
                                    </div>
                                </div>
                            </div>
                        </b-nav-item>
                        <b-nav-item
                            :to="`/pool/${selectedPool._id}/settings`"
                            link-classes="nav-link-wrapper"
                            class="nav-link-plain"
                        >
                            <div class="d-flex">
                                <div class="nav-link-icon">
                                    <i class="fas fa-cogs"></i>
                                </div>
                                <div class="flex-grow-1 justify-content-between d-flex align-items-center">
                                    <span>Settings</span>
                                </div>
                            </div>
                        </b-nav-item>
                    </b-navbar-nav>
                    <hr />
                </template>
                <hr class="m-0 mt-auto" />
                <div class="d-flex py-4 px-3 align-items-center justify-content-between">
                    <router-link to="/" custom v-slot="{ navigate }" class="cursor-pointer">
                        <img
                            :src="require('../../public/assets/logo.png')"
                            width="30"
                            height="30"
                            alt="THX logo"
                            @click="navigate"
                            @keypress.enter="navigate"
                            role="link"
                        />
                    </router-link>
                    <b-badge variant="primary" class="p-2">Plan: {{ AccountPlanType[account.plan] }}</b-badge>
                </div>
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
import BaseNavbarNav from './BaseNavbarNav.vue';
import { TAccount, TPool } from '@thxnetwork/types/interfaces';
import { AccountPlanType } from '@thxnetwork/types/enums';
import { BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { hasBasicAccess } from '@thxnetwork/common';

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
    AccountPlanType = AccountPlanType;
    dashboardUrl = BASE_URL;
    plans = plans;
    ERC20Type = ERC20Type;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    walletUrl = process.env.VUE_APP_WALLET_URL;
    pools!: IPools;
    account!: TAccount;
    isVisible = true;
    hasBasicAccess = hasBasicAccess;

    get tokenRoutes() {
        return [
            {
                path: '/pools',
                label: 'Campaigns',
                iconClasses: 'fas fa-chart-pie',
                children: [],
            },
            {
                path: '/coins',
                label: 'Coins',
                iconClasses: 'fas fa-coins',
                children: [],
            },
            {
                path: '/nft',
                label: 'NFT',
                iconClasses: 'fas fa-palette',
                children: [],
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

    onClickPreview() {
        if (!this.selectedPool) return;
        window.open(BASE_URL + '/preview/' + this.selectedPool._id, '_blank');
    }

    async onPoolSelect(pool: TPool) {
        if (!pool.address) {
            await this.$store.dispatch('pools/read', pool._id);
        }
        if (pool._id === this.$route.params.id) return;
        this.$router.push({ path: `/pool/${pool._id}`, params: { id: pool._id } });
    }
}
</script>
<style lang="scss">
.truncate-pool-title {
    text-overflow: ellipsis;
    overflow: hidden;
    display: block !important;
    width: 125px;
    text-align: left;
    white-space: nowrap;
}
.btn-toggle-campaign {
    margin: 0 0.5rem 1px;
    padding: 0;
    display: flex;

    .split-button-icon {
        width: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .btn {
        background-color: #e9ecef;
        padding: 0.5rem 0.25rem;
    }

    .dropdown-toggle {
        padding-right: 1rem;
        flex-shrink: 0;
        width: 35px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--gray);

        &:hover,
        &:focus {
            color: var(--gray) !important;
        }
    }

    .dropdown-toggle::after {
        content: '\f142';
        margin: 0 !important;
        border: 0;
        height: auto;
        width: auto;
        font-weight: 900;
        font-family: 'Font Awesome 5 Free';
    }
}
</style>
