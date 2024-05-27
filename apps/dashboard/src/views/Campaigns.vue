<template>
    <div>
        <div class="container-xl">
            <b-jumbotron
                class="mt-3 jumbotron-header"
                bg-variant="light"
                :style="{
                    'min-height': 'none',
                    'border-radius': '1rem',
                    'background-size': 'cover',
                    'background-image': `url(${require('@thxnetwork/dashboard/../../public/assets/thx_jumbotron.webp')})`,
                }"
            >
                <div class="container container-md py-5">
                    <p class="brand-text">Campaigns</p>
                    <b-button v-b-modal="'modalCreateCampaign'" class="rounded-pill mr-2" variant="secondary">
                        <i class="fas fa-plus mr-2"></i>
                        <span>Create Campaign</span>
                    </b-button>
                    <b-button href="https://docs.thx.network" variant="link" class="text-light">
                        <i class="fas fa-edit mr-2"></i>
                        <span>User Guides</span>
                    </b-button>
                </div>
            </b-jumbotron>
        </div>
        <b-container>
            <b-row>
                <b-col md="3" :key="key" v-for="(pool, key) of pools" class="pb-3">
                    <BaseCardPool :pool="pool" />
                </b-col>
                <b-col md="3" v-if="Object.values(pools).length < 4">
                    <b-card class="h-100" body-class="justify-content-center align-items-center d-flex">
                        <b-button v-b-modal="'modalCreateCampaign'" variant="primary">
                            <i class="fas fa-plus ml-0" />
                        </b-button>
                    </b-card>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseCardPool from '@thxnetwork/dashboard/components/cards/BaseCardPool.vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseCardPool,
    },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Tokens extends Vue {
    pools!: IPools;

    mounted() {
        this.$store.dispatch('account/getProfile');
    }
}
</script>
