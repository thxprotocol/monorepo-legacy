<template>
    <div class="container pb-5 pt-5" ref="subscribe">
        <div class="row">
            <div class="col-md-6 order-1 order-lg-0">
                <img
                    v-lazy="require('../../../public/assets/img/thx_token_subscribe.webp')"
                    class="img-fluid h-100 rounded"
                    alt="Token subscribe"
                />
            </div>
            <div class="col-md-6 order-0 order-lg-0">
                <b-card
                    bg-variant="secondary"
                    body-class="p-md-5 flex-column center-center"
                    class="border-0 rounded-lg"
                >
                    <div class="p-md-4">
                        <h2 class="font-weight-bold mb-3">Sign-up for the email newsletter</h2>
                        <p class="large">
                            Never miss a THX Network update. You'll get the most important news about THX Network right
                            in your inbox.
                        </p>
                        <b-card
                            bg-variant="light"
                            body-class="p-0 flex-column center-center "
                            class="shadow-lg  py-5 rounded-lg ml-form-embedContainer ml-subscribe-form ml-subscribe-form-5025221"
                            id="mlb2-5025221"
                        >
                            <div class="ml-form-align-center m-auto" style="max-width: 308px">
                                <div class="ml-form-embedWrapper embedForm">
                                    <div class="ml-form-embedBody ml-form-embedBodyDefault row-form">
                                        <div class="ml-form-embedContent" style="margin-bottom:0"></div>
                                        <form
                                            class="ml-block-form"
                                            action="https://static.mailerlite.com/webforms/submit/t1e6s0"
                                            data-code="t1e6s0"
                                            method="post"
                                            target="_blank"
                                        >
                                            <div class="ml-form-formContent">
                                                <div class="ml-form-fieldRow ml-last-item">
                                                    <label class="font-weight-bold mb-3 h3 text-dark">
                                                        Yes, sign me up for the newsletter!
                                                    </label>
                                                    <div
                                                        class="ml-field-group ml-field-email ml-validate-email ml-validate-required form-group"
                                                    >
                                                        <input
                                                            aria-label="email"
                                                            aria-required="true"
                                                            type="email"
                                                            class="form-control"
                                                            data-inputmask=""
                                                            name="fields[email]"
                                                            placeholder="Your e-mail address"
                                                            autocomplete="email"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <input type="hidden" name="ml-submit" value="1" />
                                            <div class="ml-form-embedSubmit text-center">
                                                <vue-recaptcha
                                                    ref="reCaptcha"
                                                    class=" form-group"
                                                    sitekey="6LfMAyAcAAAAAFy-9fKnxB-8mk__BYyChBfhqVJV"
                                                    @verify="isSubmitDisabled = false"
                                                    @expired="isSubmitDisabled = true"
                                                    @error="error = 'Recaptcha issue'"
                                                >
                                                </vue-recaptcha>

                                                <button
                                                    type="submit"
                                                    :disabled="isSubmitDisabled"
                                                    class="btn btn-primary btn-block rounded-pill m-auto"
                                                >
                                                    Keep me updated
                                                </button>
                                            </div>
                                            <input type="hidden" name="anticsrf" value="true" />
                                        </form>
                                    </div>
                                    <div class="ml-form-successBody row-success" style="display:none">
                                        <div class="ml-form-successContent alert alert-success">
                                            <strong>Thank you!</strong>
                                            <p class="m-0">You have successfully joined our subscriber list.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </b-card>
                    </div>
                </b-card>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BCard } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import VueRecaptcha from 'vue-recaptcha';

@Component({
    components: {
        'b-card': BCard,
        'b-button': BButton,
        'vue-recaptcha': VueRecaptcha,
    },
})
export default class BaseTokenLaunchSubscribe extends Vue {
    isSubmitDisabled = true;
    mounted() {
        if (this.$route.hash === '#subscribe') {
            const element = this.$refs['subscribe'] as HTMLElement;
            this.$Lazyload.$on('loaded', (event: any) => {
                if (event.src.startsWith('/img/thx_jumbotron_token_bg')) {
                    window.scrollTo(0, element.offsetTop);
                }
            });
        }
    }
}
</script>
