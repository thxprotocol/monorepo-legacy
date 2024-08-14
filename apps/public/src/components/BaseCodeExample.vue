<template>
    <section class="py-5">
        <hr />
        <div class="container py-5">
            <div class="row pb-lg-5">
                <div class="col-lg-4 offset-lg-1 order-lg-0 align-items-center">
                    <h2 class="h5">Embedded Loyalty</h2>
                    <p class="lead">Engage Your Audience in Three Easy Steps</p>
                    <ol class="lead">
                        <li>Copy &amp; paste a small piece of code</li>
                        <li>Launch quests and rewards immediately</li>
                        <li>Monitor results in the analytics dashboard</li>
                    </ol>
                    <p>
                        Using our front-end integrated wallet or SDK your team saves months of work compared to starting
                        from scratch.
                    </p>
                </div>
                <div class="col-lg-6 pb-3">
                    <img
                        width="100%"
                        class="mb-5"
                        v-lazy="require('../../public/assets/img/thx_widget_launcher.png')"
                    />
                </div>
                <div class="col-md-10 offset-md-1">
                    <div class="text-muted mb-2">All you do is paste this (example) script in your HTML page</div>
                    <pre
                        class="rounded p-3 mb-2 w-100 text-white"
                        style="background-color: #282c34; white-space: pre-line"
                    >
                        <code class="language-common" v-html="codeExample2"></code>
                    </pre>
                    <div class="text-right">
                        <b-button @click="onClickLaunchWidget" variant="link" class="rounded-pill">
                            Open example widget
                            <i data-v-fddfcf4a="" class="fas fa-chevron-right" aria-hidden="true"></i>
                        </b-button>
                    </div>
                </div>
            </div>
            <hr />
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
    codeExample2 = hljs.highlight(
        `<script src="https://api.thx.network/v1/widget/507f191e810c19729de860ea.js"><\/script>`,
        {
            language: 'xml',
        },
    ).value;

    onClickLaunchWidget() {
        const element = document.getElementById('thx-launcher');
        element?.click();
    }
}
</script>
<style>
div.code {
    white-space: pre;
}
</style>
