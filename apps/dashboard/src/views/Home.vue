<template>
    <div>
        <div v-if="profile">
            <BaseModalOnboarding :loading="!firstPool" @hide="onForceRequestEmail" />
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
                            {{ 'Hi ' + (!profile.firstName ? 'Anon' : profile.firstName) }}
                        </p>
                        <div class="lead mb-3">Welcome to your Loyalty Network!</div>
                    </div>
                </b-jumbotron>
            </div>
            <div class="container container-md">
                <strong class="text-muted">Rewards</strong>
                <b-row>
                    <b-col md="3">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/daily`"
                        >
                            <template #header>
                                <i class="fas fa-calendar mr-2 text-primary"></i>
                                <strong>Daily</strong>
                            </template>
                            Reward frequent return visits to your site.
                        </BaseCardHome>
                    </b-col>
                    <b-col md="3">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/referrals`"
                        >
                            <template #header>
                                <i class="fas fa-comments mr-2 text-primary"></i>
                                <strong>Referral</strong>
                            </template>
                            Reward your users for inviting others.
                        </BaseCardHome>
                    </b-col>
                    <b-col md="3">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/conditional`"
                        >
                            <template #header>
                                <i class="fas fa-trophy mr-2 text-primary"></i>
                                <strong>Conditional</strong> </template
                            >Reward engagement in other platforms.
                        </BaseCardHome>
                    </b-col>
                    <b-col md="3">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/milestones`"
                        >
                            <template #header>
                                <i class="fas fa-trophy mr-2 text-primary"></i>
                                <strong>Milestone</strong> </template
                            >Reward all moments your the user expierience.
                        </BaseCardHome>
                    </b-col>
                </b-row>
                <hr />
                <strong class="text-muted">Perks</strong>
                <b-row>
                    <b-col md="6">
                        <b-card
                            @click="$router.push('/coins')"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx_tokens.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Coins</strong>
                            <p class="text-muted m-0">Create or import ERC-20 tokens as Coins.</p>
                        </b-card>
                    </b-col>
                    <b-col md="6">
                        <b-card
                            @click="$router.push('/nft')"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx_nft.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>NFT</strong>
                            <p class="text-muted m-0">Create or import ERC-721 token variations as NFT's.</p>
                        </b-card>
                    </b-col>
                </b-row>
                <hr />
                <b-row>
                    <b-col md="3">
                        <b-card
                            @click="$router.push(`/pool/${firstPool ? firstPool._id : 'unknown'}/widget`)"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx-home-widget.png')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Widget</strong>
                            <p class="text-muted m-0">Embed and increase customer loyalty!</p>
                        </b-card>
                    </b-col>
                    <b-col md="3">
                        <b-card
                            @click="$router.push('/pools')"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx_pools.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Pools</strong>
                            <p class="text-muted m-0">Create separate reward and perk configurations.</p>
                        </b-card>
                    </b-col>
                    <b-col md="3">
                        <b-card
                            @click="window.open(docsUrl, '_blank')"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx_docs.webp')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>User Guides</strong>
                            <p class="text-muted m-0">Learn how to configure your Loyalty Pool.</p>
                        </b-card>
                    </b-col>
                    <b-col md="3">
                        <b-card
                            @click="window.open('https://discord.com/invite/TzbbSmkE7Y', '_blank')"
                            class="mt-3 mb-3 cursor-pointer"
                            :img-src="require('../../public/assets/thx-home-discord.png')"
                            img-alt="Image"
                            img-top
                        >
                            <strong>Discord</strong>
                            <p class="text-muted m-0">If you need some help we are over here!</p>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { AccountPlanType, IAccount } from '@thxnetwork/dashboard/types/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRequestAccountEmailUpdate from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';
import BaseModalOnboarding from '@thxnetwork/dashboard/components/modals/BaseModalOnboarding.vue';
import BaseCardHome from '@thxnetwork/dashboard/components/cards/BaseCardHome.vue';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import { IPools } from '../store/modules/pools';

@Component({
    components: {
        BaseModalRequestAccountEmailUpdate,
        BaseModalOnboarding,
        BaseCardHome,
        BaseCodeExample,
    },
    computed: mapGetters({
        profile: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class HomeView extends Vue {
    window = window;
    pools!: IPools;
    profile!: IAccount;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    AccountPlanType = AccountPlanType;

    get firstPool() {
        const pools = Object.values(this.pools);
        if (!pools.length) return;
        return pools[0];
    }

    async mounted() {
        await this.$store.dispatch('account/getProfile');
        this.onForceRequestEmail();
    }

    onForceRequestEmail() {
        if (!this.profile.email) {
            this.$bvModal.show('modalRequestAccountEmailUpdate');
        }
    }
}
</script>
<style scoped lang="scss">
.jumbotron-header > .container {
    background-repeat: no-repeat;
    background-position: 80% 25px;
    background-size: 350px auto;
}
</style>
