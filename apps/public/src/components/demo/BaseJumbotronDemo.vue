<template>
    <div>
        <b-jumbotron
            class="large"
            v-lazy:background-image="require('../../../public/assets/img/thx_jumbotron_token_bg.webp')"
        >
            <div class="container">
                <div class="row">
                    <div class="col-lg-4 d-flex flex-column justify-content-center align-items-start">
                        <h1 class="text-secondary mb-3 font-size-10">
                            THX in <br />
                            action
                        </h1>
                        <div class="lead mb-3 text-muted font-weight-bold d-flex">
                            <div>
                                <i class="fas fa-clock mr-3"></i>
                            </div>
                            <div>30 minutes</div>
                        </div>
                        <div class="lead mb-4 text-white font-weight-bold d-flex">
                            <div>
                                <i class="fas fa-video mr-3"></i>
                            </div>
                            <p>Web conferencing details provided upon confirmation.</p>
                        </div>
                        <p class="mb-3 text-white">
                            THX Network allows you to create and embed your own tokens in any app or website, boosting
                            engagement and increasing revenue.
                        </p>
                        <p class="mb-5 text-white">
                            Learn more about how THX Network can work for you, your organization and your community!
                        </p>
                        <div class="d-flex align-items-center">
                            <img
                                v-if="!selectedCalendly"
                                width="80"
                                class="rounded-pill p-1 bg-white d-inline mr-3"
                                v-lazy="require('../../../public/assets/img/calendly-mieszko.png')"
                                alt=""
                            />
                            <img
                                v-if="selectedCalendly"
                                width="80"
                                class="rounded-pill p-1 bg-white d-inline mr-3"
                                v-lazy="require('../../../public/assets/img/calendly-steffen.jpg')"
                                alt=""
                            />
                            <b-button
                                variant="outline-secondary"
                                class="d-inline rounded-pill"
                                target="_blank"
                                :href="calendlyURL"
                            >
                                Schedule a demo
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </div>
                    <div class="col-lg-7 offset-lg-1 py-5">
                        <div ref="widgetCalendly" class="calendly-widget"></div>
                        <div class="d-inline-flex align-items-center text-white py-3 justify-content-center w-100">
                            <strong class="m-0 mr-4">Demo with Mieszko</strong>
                            <div class="custom-control custom-switch custom-switch-light custom-switch-lg">
                                <input
                                    type="checkbox"
                                    v-model="selectedCalendly"
                                    @change="updateCalendly"
                                    :value="true"
                                    :unchecked-value="false"
                                    class="custom-control-input"
                                    id="customCalendlyUrlSwitch"
                                />
                                <label class="custom-control-label" for="customCalendlyUrlSwitch"> </label>
                            </div>
                            <strong class="m-0">Demo with Steffen</strong>
                        </div>
                    </div>
                </div>
            </div>
        </b-jumbotron>
        <div class="bg-secondary">
            <div class="container">
                <div class="row py-5">
                    <div class="col-lg-3 mb-3 mb-lg-0">
                        <strong class="h2">THX Network Communities</strong>
                    </div>
                    <div class="col-lg-3 align-items-center d-flex">
                        <div class="d-flex py-2">
                            <div
                                class="d-inline-flex p-3 bg-dark rounded-circle text-secondary mr-3"
                                style="width: 50px; height: 50px"
                            >
                                <i class="fab fa-twitter"></i>
                            </div>
                            <div>
                                <strong>Twitter</strong><br />
                                <p class="m-0">1846 followers</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 align-items-center d-flex">
                        <div class="d-flex py-2">
                            <div
                                class="d-inline-flex p-3 bg-dark rounded-circle text-secondary mr-3"
                                style="width: 50px; height: 50px"
                            >
                                <i class="fab fa-discord"></i>
                            </div>
                            <div>
                                <strong>Discord</strong><br />
                                <p class="m-0">903 members</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 align-items-center d-flex">
                        <div class="d-flex py-2">
                            <div
                                class="d-inline-flex p-3 bg-dark rounded-circle text-secondary mr-3"
                                style="width: 50px; height: 50px"
                            >
                                <i class="fab fa-telegram-plane"></i>
                            </div>
                            <div>
                                <strong>Telegram</strong><br />
                                <p class="m-0">309 members</p>
                            </div>
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

const Calendly = (window as any).Calendly;
const CALENDLY_STEFFEN = 'https://calendly.com/mieszko/demo';
const CALENDLY_MIESZKO = 'https://calendly.com/mieszko/demo';

@Component({
    components: {
        BJumbotron,
        BButton,
        BFormInput,
    },
})
export default class BaseJumbotronDemo extends Vue {
    selectedCalendly = false;

    mounted() {
        this.updateCalendly();
    }

    get calendlyURL() {
        return this.selectedCalendly ? CALENDLY_STEFFEN : CALENDLY_MIESZKO;
    }

    updateCalendly() {
        (this.$refs.widgetCalendly as Element).innerHTML = '';

        Calendly.initInlineWidget({
            url: `${this.calendlyURL}?text_color=f8f9fa&background_color=212529&primary_color=ffe500&hide_landing_page_details=1&hide_event_type_details=1&hide_gdpr_banner=1`,
            parentElement: this.$refs.widgetCalendly,
            prefill: {},
            utm: {},
        });
    }
}
</script>
