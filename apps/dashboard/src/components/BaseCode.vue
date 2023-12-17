<template>
    <pre class="position-relative rounded text-white p-3 d-flex align-items-center bg-darker overflow-hidden">
        <b-button 
            size="sm"
            style="top: .5rem; right: .5rem; height: 40px; width: 40px;"
            class="position-absolute p-0 d-flex align-items-center justify-content-center"
            variant="light" 
            v-clipboard:copy="code"
            v-clipboard:success="() => isCopied = true">
            <i class="fas ml-0 d-block" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
        </b-button>
        <code class="language-html small" v-html="codeExample"></code>
    </pre>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';
import XML from 'highlight.js/lib/languages/xml';
import JavaScript from 'highlight.js/lib/languages/javascript';
import Shell from 'highlight.js/lib/languages/shell';

hljs.registerLanguage('shell', Shell);
hljs.registerLanguage('xml', XML);
hljs.registerLanguage('js', JavaScript);

@Component({})
export default class BaseCodeExample extends Vue {
    isCopied = false;

    @Prop() code!: string;
    @Prop() language!: 'xml' | 'js' | 'shell';

    get codeExample() {
        return hljs.highlight(this.code, { language: this.language }).value;
    }
}
</script>
