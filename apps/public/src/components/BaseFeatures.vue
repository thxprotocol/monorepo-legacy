<template>
    <section id="section-features" class="bg-darker text-light py-5 w-100">
        <div class="container pt-lg-10">
            <div class="row pb-5">
                <div class="col-lg-6 offset-lg-3">
                    <div class="text-center">
                        <h2 class="h5 text-dark">Why THX?</h2>
                        <p class="lead mb-4 h1">Boost engagement <br />and revenue.</p>
                    </div>
                </div>
            </div>
            <div class="row pb-lg-5 pt-5">
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_fastandfree.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_FAST_AND_FREE"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Free Transactions on Polygon and Linea</h3>
                    </div>
                    <p class="line-height-2">We cover gas costs to remove UX barriers for your users.</p>
                    <p class="text-gray line-height-2">
                        We support Polygon and Linea relayers, and our web3 quests work on Ethereum, BSC, Polygon zkEVM,
                        Base, and Arbitrum. If your blockchain isn’t listed, just ask in our Discord.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-money-check-alt"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Lower Customer Acquisition Costs (CAC)</h3>
                    </div>
                    <p class="line-height-2">
                        Community referrals attract enthusiastic users, reducing your customer acquisition costs.
                    </p>
                    <p class="text-gray line-height-2">
                        Quests and referrals are more cost-effective than traditional advertising, leading to reduced
                        costs per acquisition (CPA).
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_time.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_TIME"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Higher Lifetime Value (LTV)</h3>
                    </div>
                    <p class="line-height-2">
                        By combining loyalty rewards, quests, and referrals, you broaden and lengthen the user journey
                        within your community.
                    </p>
                    <p class="text-gray line-height-2">
                        This encourages users to spend more time and money on your project or game, boosting customer
                        lifetime value (LTV).
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { BButton, BLink } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { ALT_TEXT } from '@thxnetwork/public/utils/constants';

@Component({
    components: {
        'b-link': BLink,
        'b-button': BButton,
    },
})
export default class BaseFeatures extends Vue {
    ALT_TEXT = ALT_TEXT;
}
</script>
