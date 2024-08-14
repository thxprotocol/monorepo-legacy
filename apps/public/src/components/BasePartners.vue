<template>
    <div class="bg-dark text-white">
        <section class="container pt-lg-5 pb-lg-5">
            <div class="row pt-5">
                <div class="col-md-12 text-center pt-5 pb-5">
                    <h2 class="text-uppercase font-weight-bold">Our Partners</h2>
                </div>
            </div>
            <div class="row pb-5">
                <div class="col-6 col-md-4 text-center">
                    <a href="https://polygon.technology/" target="_blank" class="card-logo card-logo-lg m-auto">
                        <img
                            height="40"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_polygon.png')"
                            :alt="ALT_TEXT.HOME_POLYGON_TECHNOLOGY"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>Bringing massive scale to Ethereum</strong>
                    </p>
                </div>
                <div class="col-6 col-md-4 text-center">
                    <a href="https://techstars.com" target="_blank" class="card-logo card-logo-lg m-auto">
                        <img
                            width="120"
                            height="auto"
                            v-lazy="require('../../public/assets/img/techstars.png')"
                            :alt="ALT_TEXT.HOME_NEW_TECHSTARS"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>The largest pre-seed investor in the world</strong>
                    </p>
                </div>
                <div class="col-6 col-md-4 text-center">
                    <a
                        href="https://blockis.eu/hall-of-fame/open-call-2/"
                        target="_blank"
                        class="card-logo card-logo-lg m-auto"
                    >
                        <img
                            height="25"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_blockis.png')"
                            :alt="ALT_TEXT.HOME_BLOCKIS"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>Catalyzing blockchain innovation</strong>
                    </p>
                </div>
            </div>
        </section>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ALT_TEXT } from '@thxnetwork/public/utils/constants';

@Component
export default class BaseTeam extends Vue {
    ALT_TEXT = ALT_TEXT;
}
</script>
