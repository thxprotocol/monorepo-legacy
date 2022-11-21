<template>
    <section class="bg-darker py-5">
        <div class="container py-5">
            <div class="row">
                <div class="col-md-5 offset-md-1 text-white align-items-center d-flex py-5">
                    <div>
                        <h2 class="h5 text-dark">No Code</h2>
                        <p class="lead h1 text-uppercase">Launch token smart contracts</p>
                        <p class="lead">
                            Just point and click to launch a smart contract. Your users claim your tokens and NFTs using
                            a social login or their Metamask account. Our brandable wallet handles transaction fees on
                            behalf of your users. 100% frictionless onboarding!
                        </p>
                        <b-button
                            class="mt-3 rounded-pill"
                            variant="primary"
                            :href="dashboardUrl"
                            :title="TITLES.HOME_VISIT_YOUR_DASHBOARD"
                        >
                            Create tokens in THX Dashboard
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
                <div class="col-md-6 py-5">
                    <img
                        class="rounded"
                        width="100%"
                        v-lazy="require('../../public/assets/img/thx_ui-demo.png')"
                        alt=""
                    />
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { BButton, BJumbotron } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { Hooper, Slide } from 'hooper';
import { TITLES } from '@thxnetwork/public/utils/constants';

@Component({
    components: {
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'hooper': Hooper,
        'slide': Slide,
    },
})
export default class BaseMetrics extends Vue {
    TITLES = TITLES;
    dashboardUrl = process.env.VUE_APP_DASHBOARD_URL;
}
</script>
