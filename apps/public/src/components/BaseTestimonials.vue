<template>
    <section class="pb-5 pt-5" :class="{ 'bg-before-dark': home, 'pt-lg-10': !home }">
        <div class="container level-1 pb-5">
            <div class="row">
                <div class="col-md-5 offset-lg-1 order-1 order-lg-0">
                    <b-card bg-variant="secondary" body-class="p-3 p-md-5" class="mb-5 border-0">
                        <h2 class="bg-dark text-white h5 mb-4">"Can do" mindset</h2>
                        <p class="lead font-italic font-weight-light mb-5 line-height-2">
                            "Working with the THX Network team has been a fantastic experience. We share a “can do”
                            mindset, which has made it easy to work together and achieve our shared goals."
                        </p>
                        <div class="d-flex">
                            <div class="pr-3">
                                <img
                                    class="bg-white rounded-circle"
                                    v-lazy="require('../../public/assets/img/jason.png')"
                                    width="75"
                                    :alt="ALT_TEXT.HOME_NINA_GRINMAN"
                                />
                            </div>
                            <div class="align-items-center">
                                <p style="font-size: 1.2rem" class="mt-2 font-weight-bold mb-0">
                                    Jason 'Bitbender' Brink
                                </p>
                                <p class="font-weight-light mb-0">
                                    President of Blockchain at
                                    <strong>Gala</strong>
                                </p>
                            </div>
                        </div>
                    </b-card>
                    <img
                        v-lazy="require('../../public/assets/img/thx_testimonial_girl.webp')"
                        class="img-fluid w-100 rounded"
                        :alt="ALT_TEXT.HOME_TESTIMONIAL_GIRL"
                    />
                </div>
                <div class="col-md-5 order-0 flex-column d-flex justify-content-between">
                    <div class="p-lg-5">
                        <h2 class="h5 text-dark">Customers love us</h2>
                        <p class="lead mb-4 h1" :class="{ 'text-white': home }">
                            Both clients <br />
                            and developers.
                        </p>
                    </div>
                    <b-card bg-variant="white" body-class="p-3 p-md-5" class="mb-3 mb-lg-0">
                        <h2 class="bg-dark text-white h5 mb-4">Reliable partner</h2>
                        <p class="lead font-italic font-weight-light mb-5 line-height-2">
                            "THX Network is the infrastructure we need for our Quest product, allowing us to focus
                            solely on our game."
                        </p>
                        <div class="d-flex">
                            <div class="pr-3">
                                <img
                                    class="rounded-circle"
                                    v-lazy="require('../../public/assets/img/thx_avatar_behfar.jpg')"
                                    width="75"
                                    :alt="ALT_TEXT.HOME_ERIK_DE_GRAAF"
                                />
                            </div>
                            <div class="align-items-center">
                                <p style="font-size: 1.2rem" class="mt-2 font-weight-bold mb-0">Behfar</p>
                                <p class="font-weight-light mb-0">CEO at <strong>Chrono Games</strong></p>
                            </div>
                        </div>
                    </b-card>
                </div>
            </div>
            <div class="row" v-if="!home">
                <div class="col-lg-8 offset-lg-2 text-center pt-5">
                    <b-button variant="dark" class="rounded-pill" href="https://thx.page.link/UNDP" target="_blank">
                        Download our business case
                        <i class="fas fa-chevron-right"></i>
                    </b-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { BButton, BCard } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ALT_TEXT } from '@thxnetwork/public/utils/constants';

@Component({
    components: {
        'b-card': BCard,
        'b-button': BButton,
    },
})
export default class BaseTestimonials extends Vue {
    @Prop() home!: boolean;
    ALT_TEXT = ALT_TEXT;
}
</script>

<style scoped>
.lead {
    font-size: 1.8rem;
}
</style>
