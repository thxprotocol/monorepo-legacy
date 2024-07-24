<template>
    <div class="container">
        <div class="row pb-lg-5 pt-5">
            <div class="col-md-10 offset-lg-1">
                <div class="col-md-12 text-center p-5">
                    <h2 class="h5">Benefits</h2>
                    <p class="lead h1 text-uppercase">The THX Token</p>
                </div>
                <div class="row">
                    <div class="col-md-4 pb-3 pb-md-5">
                        <div class="mb-5">
                            <span class="icon bg-secondary rounded">
                                <img
                                    width="35"
                                    v-lazy="require('../../../public/assets/img/thx_feature_governance.webp')"
                                    alt=""
                                />
                            </span>
                        </div>
                        <h3 class="text-dark mb-3">Govern the protocol</h3>
                        <p class="text-gray line-height-2">
                            As a token holder you govern the parameters and improvements to the protocol. Voting using
                            snapshot.org starts Q1 2022.
                            <a class="d-inline-flex align-items-center" href="https://docs.thx.network/token/">
                                <span class="font-weight-bold">Read more</span>
                                <i class="fas fa-chevron-right ml-2"></i>
                            </a>
                        </p>
                    </div>
                    <div class="col-md-4 pb-3 pb-md-5">
                        <div class="mb-5">
                            <span class="icon bg-secondary rounded">
                                <img
                                    width="35"
                                    v-lazy="require('../../../public/assets/img/thx_feature_claimfees.webp')"
                                    alt=""
                                />
                            </span>
                        </div>
                        <h3 class="text-dark mb-3">Claim fees</h3>
                        <p class="text-gray line-height-2">
                            Upon community vote, and after on-chain activation, the token is able to accurate protocol
                            fees which you can claim using the THX token.
                            <a class="d-inline-flex align-items-center" href="https://docs.thx.network/token/">
                                <span class="font-weight-bold">Read more</span>
                                <i class="fas fa-chevron-right ml-2"></i>
                            </a>
                        </p>
                    </div>
                    <div class="col-md-4 pb-3 pb-md-5">
                        <div class="mb-5">
                            <span class="icon bg-secondary rounded">
                                <img
                                    width="35"
                                    v-lazy="require('../../../public/assets/img/thx_feature_incentives.webp')"
                                    alt=""
                                />
                            </span>
                        </div>
                        <h3 class="text-dark mb-3">Incentives for usage</h3>
                        <p class="text-gray line-height-2">
                            20% of the THX supply is allocated to usage and liquidity mining incentives. Upon token
                            holder vote at the end of Q1 2022 these programs are activated.
                            <a class="d-inline-flex align-items-center" href="https://docs.thx.network/token/">
                                <span class="font-weight-bold">Read more</span>
                                <i class="fas fa-chevron-right ml-2"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BLink } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        'b-link': BLink,
        'b-button': BButton,
    },
})
export default class BaseFeatures extends Vue {}
</script>
