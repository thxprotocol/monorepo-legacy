<template>
    <div class="container pt-md-5 pb-md-5">
        <div class="row pt-5 pb-5">
            <div class="col-md-5 offset-lg-1">
                <b-card class="border-0 p-md-5">
                    <div class="p-0">
                        <h2 class="h5">Govern parameters</h2>
                        <p class="lead">You pull the strings using the THX token</p>
                        <p class="lead font-weight-light">
                            Token holders govern the parameters and improvements to the protocol. Voting using
                            snapshot.org starts Q1 2022. Upon community vote the protocol is able to collect fees, read
                            more about this in the documentation.
                        </p>
                        <b-button
                            class="rounded-pill"
                            variant="primary"
                            href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31"
                        >
                            View our token contract
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </div>
                </b-card>
            </div>
            <div class="col-md-6">
                <img
                    v-lazy="require('../../../public/assets/img/thx_token_governance.webp')"
                    class="img-fluid w-100 rounded"
                    alt="Testimonial girl"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BCard } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        'b-card': BCard,
        'b-button': BButton,
    },
})
export default class BaseTokenContract extends Vue {}
</script>
