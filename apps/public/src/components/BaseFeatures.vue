<template>
    <section class="bg-darker text-light pb-5 w-100">
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
                        The Polygon side-chain provides fast and free transactions for your end-users.
                    </p>
                    <p class="text-gray line-height-2">
                        We sponsor the gas costs so you don’t have to worry about additional UX barriers for your
                        customers.
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
                        Referrals by loyal members and customers leads to new users that are more engaged and eager to
                        join your community.
                    </p>
                    <p class="text-gray line-height-2">
                        This is much more cost effective than advertising driving down your customer acquisition costs
                        (CAC).
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
                        Loyalty points, perks and partnerships all work together to give your users a more exciting
                        journey in your community.
                    </p>
                    <p class="text-gray line-height-2">
                        People spend more time within your organization and very naturally tend to spend more money too
                        leading to higher customer lifetime value (LTV).
                    </p>
                </div>
            </div>
            <div class="row pb-lg-5 pt-5" v-if="!selectedBenefits">
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-trophy" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Loyalty Points</h3>
                    </div>
                    <p class="line-height-2">
                        Reward engagement with loyalty points which are instantly claimable in the widget or brandable
                        wallet.
                    </p>
                    <p class="text-gray line-height-2">
                        Your users exchange points for valuable perks. Watch returning visits and conversions go through
                        the roof!
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-award" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Loyalty Perks</h3>
                    </div>
                    <p class="line-height-2">
                        Signed-up users, players or customers become true community members when receiving, exchanging
                        or buying tokenized perks.
                    </p>
                    <p class="text-gray line-height-2">
                        Make ERC-20 tokens your community currency while NFTs prove community memberships and certain
                        achievements.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <i class="fas fa-handshake" style="font-size: 2rem"></i>
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">Loyalty Partnerships</h3>
                    </div>
                    <p class="line-height-2">
                        Share your Perks across organizations in a marketplace to reach new members and customers.
                    </p>
                    <p class="text-gray line-height-2">
                        You just organized your loyalty offering into a wider reaching Loyalty Network! Cross channel
                        and cross brand loyalty is what drives long term results.
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
