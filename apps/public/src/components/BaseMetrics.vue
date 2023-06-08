<template>
    <section class="pb-5">
        <div class="container">
            <div class="row pb-5">
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">Overall</h5>
                    <div class="d-flex justify-content-between">
                        <div class="card-logo mb-3 mr-md-3">
                            <span>Campaigns</span>
                            <strong>642</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <span>Users</span>
                            <strong>13103</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <span>Transactions</span>
                            <strong>13797</strong>
                        </div>
                    </div>
                    <p class="lead font-weight-light">
                        We provide detailed insights in the performance of your campaign in our monitoring dashboard.
                    </p>
                </div>
                <div class="col-lg-1 border-right"></div>
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">Quests &amp; Rewards</h5>
                    <div class="d-flex justify-content-start">
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Daily</span>
                            <strong>2439</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Referral</span>
                            <strong>25</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Social</span>
                            <strong>1318</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Custom</span>
                            <strong>520</strong>
                        </div>
                    </div>
                    <div class="d-flex justify-content-start">
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Coin</span>
                            <strong>406</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>NFT</span>
                            <strong>412</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import hljs from 'highlight.js/lib/core';
import JavaScript from 'highlight.js/lib/languages/javascript';
import Xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';
import { ALT_TEXT, TITLES } from '@thxnetwork/public/utils/constants';

hljs.registerLanguage('javascript', JavaScript);
hljs.registerLanguage('xml', Xml);
@Component({
    components: {},
})
export default class BaseCodeExample extends Vue {
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
}
</script>
<style lang="scss">
.card-logo {
    align-items: center;
    flex-flow: column;
    justify-content: center;
    span {
        display: block;
        color: var(--gray);
    }
    strong {
        font-size: 2rem;
        color: var(--primary);
    }
}
</style>
