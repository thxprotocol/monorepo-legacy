<template>
    <pre class="rounded text-white p-3 d-flex align-items-center bg-darker overflow-hidden" style="white-space: nowrap">
        <b-button 
            variant="light" 
            v-clipboard:copy="code"
            v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
            <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
        </b-button>
        <code class="language-html" v-html="codeExample"></code>
    </pre>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { mapGetters } from 'vuex';
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('xml', XML);

@Component({
    components: {
        BaseCodeExample,
    },
    computed: mapGetters({
        pools: 'pools/all',
        widgets: 'widgets/all',
    }),
})
export default class BaseCodeExample extends Vue {
    isCopied = false;

    @Prop() pool!: TPool;

    get code() {
        return `<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`;
    }

    get codeExample() {
        return hljs.highlight(`<script src="${API_URL}/v1/widget/${this.pool._id}.js"><\/script>`, {
            language: 'xml',
        }).value;
    }
}
</script>
