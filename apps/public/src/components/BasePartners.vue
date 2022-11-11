<template>
    <div class="bg-dark text-white">
        <section class="container pt-lg-5 pb-lg-5">
            <div class="row pt-5">
                <div class="col-md-12 text-center pt-5 pb-5">
                    <h2 class="text-uppercase font-weight-bold">Our Partners</h2>
                </div>
            </div>
            <div class="row pb-5">
                <div class="col-6 col-md-2 ">
                    <a
                        v-b-tooltip.hover
                        href="https://polygon.technology/"
                        target="topright"
                        title=" Polygon uses side-chain and rollup solutions to scale the Ethereum blockchain. Polygon is supporting
                    THX as part of their 'Developer Support Program'."
                        class="card-logo card-logo-lg m-auto"
                    >
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
                <div class="col-6 col-md-2 ">
                    <a
                        v-b-tooltip.hover
                        href="https://newstateventures.co"
                        target="topright"
                        title="SBRecords is part of New State Ventures, an independent label with cross-functional venture channels."
                        class="card-logo card-logo-lg m-auto"
                    >
                        <img
                            height="50"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_sbrecords.png')"
                            :alt="ALT_TEXT.HOME_NEW_STATE_VENTURES"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>The intellectual capital company for creators</strong>
                    </p>
                </div>
                <div class="col-6 col-md-2 ">
                    <a
                        v-b-tooltip.hover
                        href="https://www.plugandplaytechcenter.com/"
                        target="topright"
                        title="Connects the best technology startups and the world’s largest corporations. THX is part of PnP’s
                    informal ‘Booster’ acceleration program in Amsterdam."
                        class="card-logo card-logo-lg m-auto"
                    >
                        <img
                            height="20"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_plugandplay.png')"
                            :alt="ALT_TEXT.HOME_PLUG_AND_PLAY_TECH_CENTER"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>The world’s leading innovation platform</strong>
                    </p>
                </div>
                <div class="col-6 col-md-2 ">
                    <a
                        v-b-tooltip.hover
                        href="https://www.getopensocial.com/"
                        target="topright"
                        title="Open Social’s community software serves 1000+ organizations globally. THX allows Open Social's
                    gamification extension to issue ERC-20 tokens as rewards."
                        class="card-logo card-logo-lg m-auto"
                    >
                        <img
                            height="80"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_opensocial.png')"
                            :alt="ALT_TEXT.HOME_GET_OPEN_SOCIAL"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>Your community engagement platform</strong>
                    </p>
                </div>
                <div class="col-6 col-md-2">
                    <a
                        v-b-tooltip.hover
                        href="https://blockis.eu/"
                        target="topright"
                        title="Block.IS is an EU Horizon 2020 acceleration program to build an open and cross-border,
                    cross-sectoral ecosystem for the use of blockchain technology."
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
                <div class="col-6 col-md-2">
                    <a
                        v-b-tooltip.hover
                        href="https://blockpool.eu/"
                        target="topright"
                        title="Blockpool is an EU Horizon 2020 accelerator to increase the cross-border uptake of Blockchain and
                    other distributed ledger tech to European SMEs."
                        class="card-logo card-logo-lg m-auto"
                    >
                        <img
                            height="60"
                            width="auto"
                            v-lazy="require('../../public/assets/img/thx_partner_blockpool.png')"
                            :alt="ALT_TEXT.HOME_BLOCKPOOL"
                        />
                    </a>
                    <p class="text-center font-weight-light mt-3">
                        <strong>Accelerating SMEs’ uptake of blockchain </strong><br /><br />
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
