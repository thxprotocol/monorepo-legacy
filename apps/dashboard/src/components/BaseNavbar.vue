<template>
    <b-navbar toggleable="lg" class="sidebar">
        <div class="d-flex justify-content-end flex-column flex-grow-1 w-100">
            <b-form-group class="mb-3 mx-2">
                <b-button-group class="w-100">
                    <b-button
                        v-if="selectedPool"
                        class="d-flex p-2 text-muted align-items-center"
                        variant="light"
                        @click="onClickCampaignURL"
                    >
                        <b-img-lazy style="max-height: 20px; max-width: 20px" :src="selectedPoolLogoImg" />
                        <div class="truncate-pool-title flex-grow-1 pl-2">
                            {{ selectedPool.settings.title }}
                        </div>
                    </b-button>
                    <b-dropdown size="sm" variant="light" right no-caret menu-class="v-overflow">
                        <template #button-content>
                            <i v-if="selectedPool" class="fas fa-caret-down text-muted m-0" style="font-size: 1.1rem" />
                            <b-spinner v-else variant="primary" small />
                        </template>
                        <b-dropdown-text>
                            <b-button
                                v-b-modal="'modalCreateCampaign'"
                                variant="primary"
                                size="sm"
                                block
                                class="rounded-pill"
                            >
                                <i class="fas fa-plus mr-1 ml-0" />
                                Campaign
                            </b-button>
                            <BaseModalPoolCreate id="modalCreateCampaign" />
                        </b-dropdown-text>
                        <b-dropdown-item-btn
                            class="small"
                            :key="key"
                            v-for="(p, key) of pools"
                            @click="onPoolSelect(p)"
                        >
                            <div class="d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <span class="truncate-pool-title">
                                        {{ p.settings.title }}
                                    </span>
                                    <i class="fas fa-caret-right text-muted ml-2"></i>
                                </div>
                            </div>
                        </b-dropdown-item-btn>
                    </b-dropdown>
                </b-button-group>
            </b-form-group>
            <b-form-group class="mb-3 mx-2">
                <b-button variant="primary" @click="onClickCampaignURL" class="p-2 w-100">
                    Campaign URL
                    <i class="fas fa-external-link-alt" />
                </b-button>
            </b-form-group>
            <b-navbar-nav class="py-0 mb-auto" v-if="selectedPool">
                <b-nav-item
                    :to="`/campaign/${selectedPool._id}/analytics`"
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
                    :to="`/campaign/${selectedPool._id}/quests`"
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
                    :to="`/campaign/${selectedPool._id}/rewards`"
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
                    :to="`/campaign/${selectedPool._id}/participants`"
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
                    :to="`/campaign/${selectedPool._id}/integrations`"
                    link-classes="nav-link-wrapper"
                    class="nav-link-plain"
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
                    :to="`/campaign/${selectedPool._id}/settings`"
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
        </div>
    </b-navbar>
</template>

<script lang="ts">
import { ERC20Type } from '@thxnetwork/dashboard/types/erc20';
import { plans } from '@thxnetwork/dashboard/utils/plans';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseNavbarNav from './BaseNavbarNav.vue';
import BaseModalPoolCreate from '@thxnetwork/dashboard/components/modals/BaseModalPoolCreate.vue';
import { BASE_URL, WIDGET_URL } from '@thxnetwork/dashboard/config/secrets';

@Component({
    components: {
        BaseNavbarNav,
        BaseModalPoolCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        account: 'account/profile',
    }),
})
export default class BaseNavbar extends Vue {
    dashboardUrl = BASE_URL;
    plans = plans;
    ERC20Type = ERC20Type;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    walletUrl = process.env.VUE_APP_WALLET_URL;
    pools!: IPools;
    account!: TAccount;
    isVisible = true;

    get selectedPoolLogoImg() {
        if (!this.selectedPool) return;

        return this.selectedPool.brand && this.selectedPool.brand.logoImgUrl
            ? this.selectedPool.brand.logoImgUrl
            : `https://api.dicebear.com/7.x/identicon/png?seed=${this.selectedPool._id}`;
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
        this.$store.dispatch('pools/list', { archived: false });
    }

    onClickCampaignURL() {
        if (!this.selectedPool) return;
        window.open(WIDGET_URL + '/c/' + this.selectedPool.settings.slug, '_blank');
    }

    async onPoolSelect(pool: TPool) {
        await this.$store.dispatch('pools/read', pool._id);
        if (pool._id === this.$route.params.id) return;
        await this.$router.push({ name: 'campaign', params: { id: pool._id } });
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
}
.v-overflow {
    max-height: 300px;
    overflow: auto;
}
</style>
