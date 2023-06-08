<template>
    <section class="bg-darker py-5">
        <div class="container py-5">
            <div class="row">
                <div class="col-md-5 offset-md-1 text-white align-items-center d-flex py-5">
                    <div>
                        <h2 class="h5 text-dark">No Code</h2>
                        <p class="lead h1 text-uppercase">Launch Quests &amp; Rewards</p>
                        <p class="lead">
                            To power your loyalty rewards, just point and click to launch a token smart contract.
                        </p>
                        <p class="lead font-weight-light">
                            Your users claim your rewards using the branded front-end wallet. 100% no code required on
                            your end!
                        </p>
                        <b-button
                            class="mt-3 rounded-pill"
                            variant="primary"
                            to="/signup"
                            :title="TITLES.HOME_VISIT_YOUR_DASHBOARD"
                        >
                            Manage rewards in your dashboard
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
                <div class="col-md-6 py-5">
                    <img
                        class="rounded"
                        width="100%"
                        v-lazy="require('../../public/assets/img/thx_widget_rewards.png')"
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
import { DASHBOARD_URL } from '../config/secrets';

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
    dashboardUrl = DASHBOARD_URL;
}
</script>
