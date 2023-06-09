<template>
    <section id="section-features" class="bg-darker text-light py-5 w-100">
        <div class="container pt-lg-10">
            <div class="row pb-5">
                <div class="col-lg-6 offset-lg-3">
                    <div class="text-center">
                        <h2 class="h5 text-dark">Why THX?</h2>
                        <p class="lead mb-4 h1">Boost engagement <br />and revenue.</p>

                        <div class="d-inline-flex align-items-center">
                            <strong class="m-0">Features</strong>
                            <div class="custom-control custom-switch custom-switch-light custom-switch-lg mb-2 ml-4">
                                <input
                                    type="checkbox"
                                    v-model="selectedBenefits"
                                    :value="true"
                                    :unchecked-value="false"
                                    class="custom-control-input"
                                    id="customFeaturesBenefitsSwitch"
                                />
                                <label class="custom-control-label" for="customFeaturesBenefitsSwitch"> </label>
                            </div>
                            <strong class="m-0">Benefits</strong>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row pb-lg-5 pt-5" v-if="selectedBenefits">
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_fastandfree.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_FAST_AND_FREE"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Free Transactions</h3>
                    </div>
                    <p class="line-height-2">
                        We sponsor the gas costs so you don't have to worry about additional UX barriers for your
                        customers.
                    </p>
                    <p class="text-gray line-height-2">
                        The Polygon blockchain provides fast and secure transactions for your users.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-money-check-alt"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Lower Acquisition Costs</h3>
                    </div>
                    <p class="line-height-2">
                        Referrals from community members attract enthusiastic new users, reducing your customer
                        acquisition costs (CAC).
                    </p>
                    <p class="text-gray line-height-2">
                        This method proves more cost-effective than traditional advertising.
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
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Higher Lifetime Value</h3>
                    </div>
                    <p class="line-height-2">
                        By combining loyalty rewards, quests, and partnerships, we enhance the user journey within your
                        community.
                    </p>
                    <p class="text-gray line-height-2">
                        This engagement encourages users to spend more time and more money in your project or game,
                        boosting the customer lifetime value (LTV).
                    </p>
                </div>
            </div>
            <div class="row pb-lg-5 pt-5" v-if="!selectedBenefits">
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-trophy" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Quests</h3>
                    </div>
                    <p class="line-height-2">
                        Reward engagement with quests and claim them instantly in the branded wallet.
                    </p>
                    <p class="text-gray line-height-2">
                        Your users exchange points for valuable rewards. Watch retention go through the roof!
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-award" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Rewards</h3>
                    </div>
                    <p class="line-height-2">
                        Users and players become true community members when receiving, exchanging or buying tokenized
                        rewards.
                    </p>
                    <p class="text-gray line-height-2">
                        Make ERC-20 tokens your currency and gate memberships with NFTs.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-handshake" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Partnerships</h3>
                    </div>
                    <p class="line-height-2">
                        Share your Rewards across projects and games to reach new users and players.
                    </p>
                    <p class="text-gray line-height-2">
                        Cross channel and cross brand loyalty is what drives long term results.
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
    selectedBenefits = false;
    ALT_TEXT = ALT_TEXT;
}
</script>
