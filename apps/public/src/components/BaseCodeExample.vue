<template>
    <section class="py-5">
        <div class="container py-5">
            <div class="row pb-lg-5">
                <div class="col-lg-6 order-1 order-lg-0 align-items-center d-flex">
                    <pre class="rounded p-5 w-100 text-white" style="background-color: #282c34;">
<code class="language-common" v-html="codeExample"></code>
                    </pre>
                </div>
                <div class="col-lg-4 offset-lg-1 pb-3">
                    <h2 class="h5">Engagement Widgets</h2>
                    <p class="lead">Tokenizing your creative work or community as easy as embedding an iframe.</p>
                    <p class="lead font-weight-light">
                        You save weeks of work by implementing blockchain technology through our widgets and API
                        compared to starting from scratch.
                    </p>
                </div>
            </div>
            <div class="row pt-5 pb-5">
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
                                :src="require('../../public/img/thx_ethereum.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_ETH"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/img/thx_polygon.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_POL"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/img/thx_oidc.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_OID"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/img/thx_ipfs.png')"
                                width="35"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_IPF"
                            />
                        </div>
                        <div class="card-logo mb-3 mr-md-3">
                            <img
                                :src="require('../../public/img/thx_amazon.png')"
                                width="55"
                                :alt="ALT_TEXT.HOME_LOGO_UNDP_TECH_AMA"
                            />
                        </div>
                    </div>
                </div>
                <div class="col-lg-1 border-right"></div>
                <div class="col-lg-4 offset-lg-1">
                    <h5 class="mb-4">Extensions</h5>
                    <div class="d-flex justify-content-between">
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/img/thx_slack.png')" width="35" alt="logo undp" />
                        </div>
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/img/thx_discord.png')" width="35" alt="logo undp" />
                        </div>
                        <div class="card-logo mr-3 mb-3">
                            <img :src="require('../../public/img/thx_drupal.png')" width="35" alt="logo undp" />
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
import 'highlight.js/styles/atom-one-dark.css';
import { ALT_TEXT, TITLES } from '@thxnetwork/public/utils/constants';

hljs.registerLanguage('javascript', JavaScript);
@Component({
    components: {},
})
export default class BaseCodeExample extends Vue {
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    codeExample = hljs.highlight(
        `// Construct THXCLient with credentials
// you obtain in THX Dashboard
const thx = new THXClient({
    clientId: "<YOUR_CLIENT_ID>",
    clientSecret: "<YOUR_CLIENT_SECRET>"
    url: "http://www.yourwebsite.com"
})
// Shows popup with OAuth2 login methods, you can
// also connect your own authorization provider.
await thx.signin();
// Returns array of NFT's owned by the authenticated user,
// user address and private key are determined by the identity
await thx.erc721.list();`,
        { language: 'javascript' },
    ).value;
}
</script>
<style>
div.code {
    white-space: pre;
}
</style>
