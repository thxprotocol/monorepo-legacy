<template>
    <section class="pt-lg-5 pb-lg-5">
        <div class="container">
            <b-card bg-variant="darker" body-class="p-0" body-text-variant="white" class="border-0 card-about-us">
                <div
                    class="card-header"
                    v-lazy:background-image="require('../../public/assets/img/thx_aboutus_guylaptop.webp')"
                ></div>
                <div class="p-3 pt-5 pb-5 p-lg-5">
                    <div class="row p-lg-5">
                        <div class="col-lg-5 offset-lg-1 text-lg-right pr-5">
                            <h2 class="h5 text-dark">About us</h2>
                            <p class="lead h1">Open Source &amp; Blockchain enthusiasts</p>
                            <p class="lead font-weight-light">
                                THX Network is brought to you by open source, UX and blockchain enthusiasts
                            </p>
                        </div>
                        <div class="col-lg-5 pl-lg-5">
                            <p class="font-weight-light line-height-2">
                                THX Network is a EU funded and Techstars backed loyalty software solution from
                                Amsterdam, The Netherlands. We love designing, building and leading open source
                                projects. We believe peer-to-peer reward systems will be nothing short of transformative
                                for our economies.
                            </p>
                            <hr class="bg-gray d-none d-lg-block mt-5 mb-5" />

                            <b-button
                                variant="light"
                                class="rounded-pill mr-auto d-block d-lg-inline"
                                to="/contact"
                                :title="TITLES.HOME_LEARN_MORE"
                            >
                                Learn more about us
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </div>
                </div>
            </b-card>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TITLES } from '@thxnetwork/public/utils/constants';

@Component
export default class BaseAboutUs extends Vue {
    TITLES = TITLES;
}
</script>
