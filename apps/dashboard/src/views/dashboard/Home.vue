<template>
    <section class="section-home" v-if="account">
        <div class="container-xl">
            <b-jumbotron
                class="text-left mt-3 jumbotron-header"
                bg-variant="light"
                :style="{
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('@thxnetwork/dashboard/../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <b-container class="container-md py-5">
                    <b-badge variant="primary" class="p-2">Plan: {{ AccountPlanType[account.plan] }}</b-badge>
                    <p class="brand-text">
                        {{ 'Hi ' + (!account.firstName ? 'Anon' : account.firstName) }}
                    </p>
                    <div class="lead mb-3">Welcome to your campaign dashboard!</div>
                </b-container>
            </b-jumbotron>
        </div>
        <b-container>
            <b-row>
                <b-col md="3" :key="key" v-for="(pool, key) of pools" class="pb-3">
                    <BaseCardPool :pool="pool" />
                </b-col>
                <b-col v-if="Object.values(pools).length < 4" md="3" class="pb-3">
                    <b-card class="h-100" body-class="justify-content-center align-items-center d-flex">
                        <b-button v-b-modal="'modalCreateCampaign'" variant="primary">
                            <i class="fas fa-plus ml-0" />
                        </b-button>
                    </b-card>
                </b-col>
            </b-row>
            <b-row>
                <b-col md="4">
                    <b-card
                        @click="window.open(docsUrl, '_blank')"
                        class="mt-3 mb-3 cursor-pointer"
                        :img-src="require('@thxnetwork/dashboard/../public/assets/thx_docs.webp')"
                        img-alt="Image"
                        img-top
                    >
                        <strong>User Guides</strong>
                        <p class="text-muted m-0">Learn how to configure quests and rewards for your campaign.</p>
                    </b-card>
                </b-col>
                <b-col md="4">
                    <b-card
                        @click="$router.push(`/developer`)"
                        class="mt-3 mb-3 cursor-pointer"
                        :img-src="require('@thxnetwork/dashboard/../public/assets/thx-home-widget.png')"
                        img-alt="Image"
                        img-top
                    >
                        <strong>Developer</strong>
                        <p class="text-muted m-0">Reward in-app user behavior using webhook and the JavaScript SDK.</p>
                    </b-card>
                </b-col>
                <b-col md="4">
                    <b-card
                        @click="window.open('https://discord.com/invite/thx-network-836147176270856243', '_blank')"
                        class="mt-3 mb-3 cursor-pointer"
                        :img-src="require('@thxnetwork/dashboard/../public/assets/thx-home-discord.png')"
                        img-alt="Image"
                        img-top
                    >
                        <strong>Discord</strong>
                        <p class="text-muted m-0">If you need some help you can reach us over here!</p>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </section>
</template>

<script lang="ts">
import { AccountPlanType } from '@thxnetwork/common/enums';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseCardHome from '@thxnetwork/dashboard/components/cards/BaseCardHome.vue';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';
import BaseCardPool from '@thxnetwork/dashboard/components/cards/BaseCardPool.vue';
import { QuestVariant } from '@thxnetwork/common/enums';
import { contentQuests, contentRewards } from '@thxnetwork/common/constants';

@Component({
    components: {
        BaseCardHome,
        BaseCodeExample,
        BaseCardPool,
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
    QuestVariant = QuestVariant;
    contentQuests = contentQuests;
    contentRewards = contentRewards;

    get firstPool() {
        const pools = Object.values(this.pools);
        if (!pools.length) return;
        return pools[0];
    }

    mounted() {
        this.$store.dispatch('pools/list');
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
