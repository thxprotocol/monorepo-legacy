<template>
    <div>
        <b-jumbotron class="bg-custom">
            <div class="container">
                <div class="row py-md-5">
                    <div class="brand-intro text-white col-lg-4 order-1 order-md-0">
                        <div>
                            <h1 class="brand-text mb-3">
                                <em>Rewards</em><br />
                                in any app
                            </h1>
                            <p class="lead mb-4">Drive growth and revenue with plug &amp; play Reward Campaigns</p>
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
                                        Start <strong>free</strong> trial
                                        <i class="fas fa-chevron-right"></i>
                                    </b-button>
                                    <b-button
                                        variant="link"
                                        class="text-dark"
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
                    <div class="col-lg-7 py-md-5 order-0 order-md-1 offset-lg-1 text-center">
                        <div>
                            <img
                                v-lazy="require('../../public/assets/img/thx_jumbotron_apps.svg')"
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
                        v-lazy="require('../../public/assets/img/techstars.png')"
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
                                v-lazy="require('../../public/assets/img/euflag.png')"
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
    signupEmail = '';
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;

    async submit() {
        const url = new URL(this.dashboardUrl);
        url.pathname = 'signup';
        url.searchParams.append('signup_plan', '1');
        if (this.signupEmail) {
            url.searchParams.append('signup_email', this.signupEmail);
        }
        window.open(url, '_blank');
    }
}
</script>

<style lang="scss" scoped>
.bg-custom {
    background-color: var(--yellow);
    background-image: radial-gradient(at 13% 67%, hsla(42, 75%, 75%, 1) 0px, transparent 50%),
        radial-gradient(at 45% 10%, rgb(255, 190, 38) 0px, transparent 50%),
        radial-gradient(at 81% 4%, rgb(255, 244, 129) 0px, transparent 50%),
        radial-gradient(at 38% 10%, hsla(53, 100%, 50%, 0.84) 0px, transparent 50%),
        radial-gradient(at 5% 50%, rgb(255, 190, 38) 0px, transparent 50%),
        radial-gradient(at 83% 2%, hsla(45, 100%, 50%, 0.79) 0px, transparent 50%),
        radial-gradient(at 83% 46%, hsla(40, 100%, 50%, 0.76) 0px, transparent 50%);

    h1.brand-text {
        font-size: 3rem !important;
        margin-top: 3rem;

        @media (min-width: 960px) {
            margin-top: 0;
            font-size: 4rem !important;
        }
    }

    .brand-intro {
        color: black !important;
    }

    em {
        font-style: normal;

        background: linear-gradient(120deg, #bb65ff, hsl(270, 74%, 41%) 33%, var(--purple));
        background-clip: text;
        -webkit-background-clip: text;
        text-fill-color: transparent;
        -webkit-text-fill-color: transparent;
    }
}
</style>
