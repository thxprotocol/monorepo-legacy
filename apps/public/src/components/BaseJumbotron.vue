<template>
    <div>
        <b-jumbotron
            bg-variant="secondary"
            v-lazy:background-image="require('../../public/assets/img/thx_jumbotron_bg.jpg')"
        >
            <div class="container">
                <div class="row py-md-5">
                    <div class="brand-intro col-lg-4 order-1 order-md-0">
                        <div>
                            <h1 class="brand-text mb-3">Token powered loyalty in any app or website</h1>
                            <p class="lead mb-4">
                                Boost engagement and create new revenue streams. Powered by a
                                <strong>battle tested loyalty API</strong>
                                and the <strong>Polygon blockchain</strong>.
                            </p>
                            <b-form id="formSignupRedirect" class="row" v-on:submit.prevent="submit">
                                <div class="col-12">
                                    <b-form-input
                                        v-model="signupEmail"
                                        type="email"
                                        class="mb-2 rounded-pill border-0 mr-3"
                                        placeholder="Your e-mail"
                                    />
                                    <b-button
                                        type="submit"
                                        form="formSignupRedirect"
                                        block
                                        variant="primary"
                                        class="rounded-pill"
                                        :title="TITLES.HOME_SIGNUP"
                                    >
                                        Sign up <strong>for free</strong>
                                        <i class="fas fa-chevron-right"></i>
                                    </b-button>
                                    <b-button
                                        variant="link"
                                        href="https://docs.thx.network"
                                        target="_blank"
                                        :title="TITLES.HOME_READ_OUR_DOCUMENTATION"
                                    >
                                        Read more in our user guides
                                        <i class="fas fa-chevron-right"></i>
                                    </b-button>
                                </div>
                            </b-form>
                        </div>
                    </div>
                    <div class="col-lg-8 pb-5 py-md-5 order-0 order-md-1 text-center">
                        <div>
                            <img
                                v-lazy="require('../../public/assets/img/thx_jumbotron_apps.webp')"
                                :alt="ALT_TEXT.HOME_MAN_WATCHING_PHONE"
                                class="img-fluid"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <div class="container">
            <div class="row">
                <div class="col-lg-4 d-flex offset-lg-2 align-items-center pt-5">
                    <img
                        width="150"
                        v-lazy="require('../../public/assets/images/techstars.png')"
                        class="img-fluid rounded mr-3"
                        :alt="ALT_TEXT.HOME_EU_FLAG"
                    />
                    <small class="m-0">
                        We’re backed by Techstars, one of the largest pre-seed investors in the world, 2022 cohort.
                    </small>
                </div>
                <div class="col-lg-4">
                    <div class="d-flex align-items-center pt-5">
                        <div class="flex-0 mr-3 rounded" style="background-color: #00349f">
                            <img
                                width="150"
                                v-lazy="require('../../public/assets/images/euflag.png')"
                                class="img-fluid rounded"
                                :alt="ALT_TEXT.HOME_EU_FLAG"
                            />
                        </div>
                        <div class="align-items-center">
                            <small class="m-0">
                                We have received funding from the European Union under agreement 82888 (Blockpool) and
                                824509 (Block.IS)
                            </small>
                        </div>
                    </div>
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
import { ALT_TEXT, TITLES } from '@thxnetwork/public/utils/constants';
import { DASHBOARD_URL } from '../config/secrets';
import BaseCardSignup from './BaseCardSignup.vue';

@Component({
    components: {
        BaseCardSignup,
        'b-jumbotron': BJumbotron,
        'b-button': BButton,
        'b-form-input': BFormInput,
    },
    computed: mapGetters({
        metrics: 'metrics/all',
    }),
})
export default class BaseJumbotron extends Vue {
    dashboardUrl = DASHBOARD_URL;
    metrics!: IMetrics;
    signupEmail = '';
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;

    async submit() {
        let url = `${this.dashboardUrl}/signup`;
        if (this.signupEmail) {
            url += `?signup_email=${this.signupEmail}`;
        }
        window.location.href = url;
    }
}
</script>
