<template>
    <section class="pb-5">
        <div class="container">
            <div class="row pb-5">
                <div class="col-lg-4 offset-lg-1">
                    <b-img
                        v-lazy="require('../../public/assets/img/thx_token_governance.webp')"
                        alt=""
                        class="img-fluid mb-3"
                    />
                    <p class="lead font-weight-light">
                        We provide growth teams serving communities of all sizes with the right tools to onboard and
                        retain more users.
                    </p>
                </div>
                <div class="col-lg-1 border-right"></div>
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">The numbers</h5>
                    <div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Campaign Participants</span>
                            <strong>18896</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Quests Entries</span>
                            <strong>19680</strong>
                        </div>
                        <div class="card-logo mb-3 mr-md-3 w-100">
                            <span>Reward Purchases</span>
                            <strong>1868</strong>
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
    width: 200px;
    span {
        display: block;
        color: var(--gray);
    }

    strong {
        font-size: 3rem;
        color: var(--primary);
    }
}
</style>
