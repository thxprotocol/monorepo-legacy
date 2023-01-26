<template>
    <div>
        <b-modal
            size="lg"
            title="Pool is deploying..."
            no-close-on-backdrop
            no-close-on-esc
            centered
            no-fade
            :hide-footer="true"
            id="modalWaitDeployPool"
            @hide="onWaitModalHide"
            :v-model="!poolsCount"
        >
            <b-alert show variant="warning" class="center-center"
                >Welcome! We are deploying your first loyalty pool.
            </b-alert>
            <div class="center-center"><b-spinner variant="primary" /></div>
        </b-modal>

        <div class="center-center h-100" v-if="!profile">
            <b-spinner variant="primary"></b-spinner>
        </div>
        <div v-else>
            <BaseModalRequestAccountEmailUpdate />
            <div class="container-xl">
                <b-jumbotron
                    class="text-left mt-3 jumbotron-header"
                    bg-variant="light"
                    :style="{
                        'border-radius': '1rem',
                        'background-size': 'cover',
                        'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
                    }"
                >
                    <div class="container container-md py-5">
                        <b-badge variant="primary" class="p-2">Plan: {{ AccountPlanType[profile.plan] }}</b-badge>
                        <p class="brand-text">
                            {{ greeting }}
                        </p>
                        <div class="lead mb-5">Welcome to your Loyalty Network</div>
                        <b-button
                            v-b-tooltip
                            title="Deploy coins"
                            to="/coins"
                            class="rounded-pill mr-3"
                            variant="primary"
                        >
                            <i class="fas fa-coins m-0"></i>
                        </b-button>
                        <b-button v-b-tooltip title="Deploy NFT" to="/nft" class="rounded-pill mr-3" variant="primary">
                            <i class="fas fa-palette m-0"></i>
                        </b-button>
                        <b-button
                            v-b-tooltip
                            title="Deploy pools"
                            to="/pools"
                            class="rounded-pill mr-3"
                            variant="primary"
                        >
                            <i class="fas fa-chart-pie m-0"></i>
                        </b-button>
                        <b-button
                            v-b-tooltip
                            title="Visit documentation"
                            :href="docsUrl"
                            target="_blank"
                            variant="link"
                            class="text-light bg-dark rounded-pill"
                        >
                            <i class="far fa-file-alt m-0 text-gray"></i>
                        </b-button>
                    </div>
                </b-jumbotron>
            </div>
            <div class="container container-md">
                <b-alert show variant="info">
                    <i class="fas fa-gift mr-2"></i><strong>New:</strong> Configure our Loyalty Widget for your site and
                    increase user engagement
                    <b-link
                        class="float-right"
                        target="_blank"
                        href="https://thx.network/use-cases/onboard-new-players-with-referrals"
                    >
                        Read more
                        <i class="fas fa-chevron-right"></i>
                    </b-link>
                </b-alert>
                <b-row>
                    <b-col md="6">
                        <b-card
                            @click="$router.push('/pools')"
                            class="mt-3 mb-3 shadow-sm cursor-pointer"
                            :img-src="require('../../public/assets/thx_pools.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Pools</strong>
                            <p class="text-muted m-0">Loyalty Pools contain point rewards and perk shops.</p>
                        </b-card>
                    </b-col>
                    <b-col md="6">
                        <b-card
                            @click="window.open(docsUrl, '_blank')"
                            class="mt-3 mb-3 shadow-sm cursor-pointer"
                            :img-src="require('../../public/assets/thx_docs.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>User Guides</strong>
                            <p class="text-muted m-0">Learn how to configure your Loyalty Pool.</p>
                        </b-card>
                    </b-col>
                    <b-col md="6">
                        <b-card
                            @click="$router.push('/coins')"
                            class="mt-3 mb-3 shadow-sm cursor-pointer"
                            :img-src="require('../../public/assets/thx_tokens.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Coins</strong>
                            <p class="text-muted m-0">Create ERC-20 token variations.</p>
                        </b-card>
                    </b-col>
                    <b-col md="6">
                        <b-card
                            @click="$router.push('/nft')"
                            class="mt-3 mb-3 shadow-sm cursor-pointer"
                            :img-src="require('../../public/assets/thx_nft.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>NFT</strong>
                            <p class="text-muted m-0">Create ERC-721 token variations.</p>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AccountPlanType, IAccount } from '@thxnetwork/dashboard/types/account';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRequestAccountEmailUpdate from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
    }),
    components: {
        BaseModalRequestAccountEmailUpdate,
    },
})
export default class Home extends Vue {
    window = window;
    profile!: IAccount;
    pools!: IPools;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    AccountPlanType = AccountPlanType;

    get greeting() {
        return 'Hi ' + (!this.profile.firstName ? 'Anon' : this.profile.firstName);
    }

    get poolsCount() {
        return !this.pools ? 0 : Object.values(this.pools).length;
    }

    async mounted() {
        await this.$store.dispatch('account/getProfile');
        this.onWaitModalHide();
    }

    onWaitModalHide() {
        if (this.poolsCount > 0 && !this.profile.email) {
            this.$bvModal.show('modalRequestAccountEmailUpdate');
        }
    }
}
</script>
<style scoped>
.jumbotron-header > .container {
    background-repeat: no-repeat;
    background-position: 80% 25px;
    background-size: 350px auto;
}
</style>
