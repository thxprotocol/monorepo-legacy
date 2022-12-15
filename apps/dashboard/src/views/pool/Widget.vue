<template>
    <div>
        <b-row class="mb-3">
            <h2 class="mb-0 mr-2">Loyalty Widget</h2>
        </b-row>
        <BCard variant="white" body-class="shadow-sm">
            <strong>Embed code</strong>
            <p class="text-muted">
                Place this code before the closing body tag of your HTML page. The launcher will appear showcasing your
                Loyalty Program to your web audience.
            </p>
            <pre class="rounded text-white p-3 d-flex align-items-center bg-darker" style="white-space: nowrap">
                <b-button variant="primary" v-b-clipboard="code" class="mr-3">
                    <i class="fas fa-clipboard ml-0"></i>
                </b-button>
                <code class="language-html" v-html="codeExample"></code>
            </pre>
        </BCard>
        <BaseModalWidgetCreate />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { API_URL } from '@thxnetwork/dashboard/utils/secrets';
import BaseModalWidgetCreate from '@thxnetwork/dashboard/components/modals/BaseModalWidgetCreate.vue';

import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseModalWidgetCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        rewards: 'rewards/all',
        widgets: 'widgets/all',
    }),
})
export default class WidgetsView extends Vue {
    pools!: IPools;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get code() {
        return `<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`;
    }

    get codeExample() {
        if (!this.pool) return;
        return hljs.highlight(`<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`, {
            language: 'xml',
        }).value;
    }

    mounted() {
        //
    }
}
</script>
