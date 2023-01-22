<template>
    <div>
        <b-jumbotron
            class="large"
            v-lazy:background-image="require('../../../public/assets/img/thx_jumbotron_token_bg.webp')"
        >
            <div class="container">
                <div class="row">
                    <div class="col-lg-4 offset-lg-1 d-flex flex-column justify-content-center align-items-start">
                        <h1 class="text-secondary mb-3 font-size-10">
                            Buy <br />
                            THX
                        </h1>
                        <p class="lead mb-5 text-white">
                            You can trade $THX in the liquidity pools on
                            <a
                                href="https://polygon.balancer.fi/#/trade/matic/0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015"
                                >Balancer</a
                            >
                            and
                            <a
                                href="https://quickswap.exchange/#/swap?inputCurrency=0x2791bca1f2de4661ed88a30c99a7a9449aa84174&outputCurrency=0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015"
                                >Quickswap</a
                            >. For recent volume and price information, check out the
                            <a href="https://www.coingecko.com/en/coins/thx-network">listing on CoinGecko</a>.
                        </p>
                        <b-button
                            variant="outline-secondary"
                            class="rounded-pill"
                            href="https://www.coingecko.com/en/coins/thx-network"
                        >
                            $THX on CoinGecko
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                    <div class="col-lg-6 offset-lg-1">
                        <img
                            :src="require('../../../public/assets/img/thx_jumbotron_token.webp')"
                            class="img-fluid"
                            alt="THX Token"
                        />
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <div class="container">
            <div class="row">
                <div class="col-xl-4 offset-xl-4 mt-5 col-md-6 offset-md-3 mb-md-3">
                    <b-row>
                        <b-col>
                            <b-img
                                fluid
                                :src="require('../../../public/assets/img/thx_logo_copper.webp')"
                                alt="Copper"
                                width="80"
                            ></b-img>
                        </b-col>
                        <b-col>
                            <b-img
                                fluid
                                :src="require('../../../public/assets/img/thx_logo_polygon.png')"
                                alt="Polygon"
                                width="100"
                            ></b-img>
                        </b-col>
                        <b-col>
                            <b-img
                                fluid
                                :src="require('../../../public/assets/img/thx_logo_balancer.webp')"
                                alt="Balancer"
                                width="100"
                            ></b-img>
                        </b-col>
                    </b-row>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { IMetrics } from '@thxnetwork/public/store/modules/metrics';
import { BButton, BJumbotron, BFormInput } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { DASHBOARD_URL } from '../../config/secrets';

@Component({
    components: {
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'b-form-input': BFormInput,
    },
    computed: mapGetters({
        metrics: 'metrics/all',
    }),
})
export default class BaseJumbotronTokenLaunch extends Vue {
    dashboardUrl = DASHBOARD_URL;
    metrics!: IMetrics;
    signupEmail = '';

    submit() {
        window.location.href =
            `${this.dashboardUrl}/signup` + (this.signupEmail ? `?signup_email=${this.signupEmail}` : '');
    }
}
</script>
