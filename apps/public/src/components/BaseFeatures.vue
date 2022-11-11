<template>
    <section class="bg-darker text-light pt-5 pb-5 w-100 pt-lg-10">
        <div class="container">
            <div class="row pb-5 pt-5">
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
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Fast &amp; Free Transactions
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        Our side-chain provides fast and free transactions for your end-users. We sponsor the gas costs
                        so you don’t have to worry about additional UX barriers for your customers.
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
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Saves you tons of time
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        Great documentation, and all the endpoints for your application to interact with. Saves you
                        hundreds of hours compared to building this from scratch.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_governance.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_GOVERNANCE"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Community governance
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        Participate in the protocol and become a THX token holder. Token holders will be able to decide
                        on important parameters in the protocol through governance and potentially activate protocol
                        fees.
                    </p>
                </div>
            </div>
            <div class="row pb-lg-5 pt-5" v-if="!selectedBenefits">
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_securekeys.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_SECURE_KEYS"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Secure keys
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        We provide best-in-class key management and key backup solutions for your users. You don’t need
                        to worry about your users losing access to their account. It also saves your support desk tons
                        of time.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_modular.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_MODULAR"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Modular
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        Your application is flexible thanks to our modular architecture. From gamified payments to your
                        own ERC-20 tokens or stablecoins. We got it all … you only need to add a few lines of code to
                        your application.
                    </p>
                </div>
                <div class="col-md-6 col-lg-4 pb-5">
                    <div class="d-flex d-lg-block mb-2 align-items-center">
                        <span class="icon rounded text-secondary mr-3">
                            <img
                                width="35"
                                v-lazy="require('../../public/assets/img/thx_feature_diamond.png')"
                                :alt="ALT_TEXT.HOME_FEATURE_DIAMOND"
                            />
                        </span>
                        <h3 class="m-0 mt-lg-4 mb-lg-3">
                            Upgradeable
                        </h3>
                    </div>
                    <p class="text-gray line-height-2">
                        Your application remains secure and functional during updates thanks to the so-called ‘diamond’
                        structure of our smart contracts. We roll out periodic updates that strengthen your
                        infrastructure.
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
