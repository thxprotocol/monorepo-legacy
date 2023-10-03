<template>
    <div>
        <div v-if="account">
            <BaseModalRequestAccountEmailUpdate :pool="firstPool" :deploying="!firstPool" />
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
                        <b-badge variant="primary" class="p-2">Plan: {{ AccountPlanType[account.plan] }}</b-badge>
                        <p class="brand-text">
                            {{ 'Hi ' + (!account.firstName ? 'Anon' : account.firstName) }}
                        </p>
                        <div class="lead mb-3">Welcome to your campaign dashboard!</div>
                    </div>
                </b-jumbotron>
            </div>
            <div class="container container-md">
                <strong class="text-muted">Quests</strong>
                <b-row>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/quests`"
                        >
                            <template #header>
                                <i class="fas fa-calendar mr-2 text-primary"></i>
                                <strong>Daily Quest</strong>
                            </template>
                            Challenge your users to visit to your website or app on a daily basis
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/quests`"
                        >
                            <template #header>
                                <i class="fas fa-comments mr-2 text-primary"></i>
                                <strong>Invite Quest</strong>
                            </template>
                            Enable your users to invite others to your app
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/quests`"
                        >
                            <template #header>
                                <i class="fas fa-trophy mr-2 text-primary"></i>
                                <strong>Social Quest</strong>
                            </template>
                            Amplify engagement in your social channels
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/quests`"
                        >
                            <template #header>
                                <i class="fas fa-trophy mr-2 text-primary"></i>
                                <strong>Custom Quest</strong>
                            </template>
                            Drive your users to achieve more things in your app
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/quests`"
                        >
                            <template #header>
                                <i class="fab fa-ethereum mr-2 text-primary"></i>
                                <strong>Web3 Quest</strong>
                            </template>
                            Let users reach certain values in your smart contracts
                        </BaseCardHome>
                    </b-col>
                </b-row>
                <hr />
                <strong class="text-muted">Rewards</strong>
                <b-row>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/rewards`"
                        >
                            <template #header>
                                <i class="fas fa-coins mr-2 text-primary"></i>
                                <strong>Coin</strong>
                            </template>
                            Create rewards for new or existing ERC20 contracts
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/rewards`"
                        >
                            <template #header>
                                <i class="fas fa-palette mr-2 text-primary"></i>
                                <strong>NFT</strong>
                            </template>
                            Create rewards for ERC721 or ERC1155 contracts
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/rewards`"
                        >
                            <template #header>
                                <i class="fas fa-gift mr-2 text-primary"></i>
                                <strong>Custom</strong>
                            </template>
                            Create rewards that trigger custom code in your app
                        </BaseCardHome>
                    </b-col>
                    <b-col md="4">
                        <BaseCardHome
                            :loading="!firstPool"
                            :url="`/pool/${firstPool ? firstPool._id : 'unknown'}/rewards`"
                        >
                            <template #header>
                                <i class="fas fa-gift mr-2 text-primary"></i>
                                <strong>Coupon</strong>
                            </template>
                            Create rewards that give your users a coupon code
                        </BaseCardHome>
                    </b-col>
                </b-row>
                <hr />
                <strong class="text-muted">Smart Contracts</strong>
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
                            <p class="text-muted m-0">Users get rewards or import ERC-20 tokens as Coins.</p>
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
                            @click="$router.push(`/pool/${firstPool ? firstPool._id : 'unknown'}/settings`)"
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
                            <strong>Campaigns</strong>
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
                            <p class="text-muted m-0">Learn how to configure your Loyalty Campaign.</p>
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
import type { TAccount } from '@thxnetwork/types/interfaces';
import { AccountPlanType } from '@thxnetwork/dashboard/types/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModalRequestAccountEmailUpdate from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';
import BaseCardHome from '@thxnetwork/dashboard/components/cards/BaseCardHome.vue';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import { IPools } from '../store/modules/pools';
import { NODE_ENV } from '../utils/secrets';
import { ChainId } from '@thxnetwork/types/enums';

@Component({
    components: {
        BaseModalRequestAccountEmailUpdate,
        BaseCardHome,
        BaseCodeExample,
    },
    computed: mapGetters({
        account: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class HomeView extends Vue {
    window = window;
    pools!: IPools;
    account!: TAccount;
    docsUrl = process.env.VUE_APP_DOCS_URL;
    AccountPlanType = AccountPlanType;

    get firstPool() {
        const pools = Object.values(this.pools);
        if (!pools.length) return;
        return pools[0];
    }

    async mounted() {
        await this.$store.dispatch('account/getProfile');
        await this.$store.dispatch('pools/list');

        if (!Object.values(this.pools).length) {
            this.$store.dispatch('pools/create', {
                chainId: NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat,
            });
        }

        if (!this.account.website || !this.account.email || !this.account.role || !this.account.goal.length) {
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
