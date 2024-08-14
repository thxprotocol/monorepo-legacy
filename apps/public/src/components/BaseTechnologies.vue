<template>
    <section class="py-5">
        <div class="container py-5">
            <div class="row pt-10 pb-5">
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">Used technologies</h5>
                    <div class="d-flex justify-content-between flex-wrap pb-5">
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_github.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_GIT"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_ethereum.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_ETH"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_polygon.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_POL"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_oidc.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_OID"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_ipfs.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_IPF"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/assets/img/thx_amazon.png')"
                                width="55"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_AMA"
                            />
                        </div>
                    </div>
                </div>
                <div class="col-lg-1 border-right"></div>
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">Extensions</h5>
                    <div class="d-flex justify-content-between flex-wrap">
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/assets/img/thx_discord.png')" width="35" alt="logo undp" />
                        </div>
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/assets/img/thx_x.svg')" width="35" alt="logo undp" />
                        </div>
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/assets/img/thx_gitcoin.svg')" width="35" alt="logo undp" />
                        </div>
                    </div>
                    <p class="lead font-weight-light">
                        Well documented, audited and battle-tested code means you get sh*t done with fewer bugs and more
                        fun.
                    </p>
                </div>
            </div>
            <div class="row pb-5">
                <div class="col-lg-12 text-center">
                    <b-button
                        variant="dark"
                        class="rounded-pill"
                        href="https://docs.thx.network"
                        target="_blank"
                        :title="TITLES.HOME_READ_THE_DOCUMENTATION"
                    >
                        Read the documentation
                        <i class="fas fa-chevron-right"></i>
                    </b-button>
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
