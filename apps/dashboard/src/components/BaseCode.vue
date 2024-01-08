<template>
    <b-card no-body class="position-relative rounded d-flex align-items-center bg-darker overflow-hidden">
        <b-tabs v-model="currentIndex" small card class="tabs-code" content-class="p-0" active-tab-class="p-1 px-3">
            <b-tab :title="language" :key="key" v-for="(language, key) of languages" :active="key === currentIndex">
                <pre class="text-white"><code class="language-html small" v-html="codeExample" /></pre>
            </b-tab>
            <template #tabs-end>
                <b-button
                    class="ml-auto my-1"
                    size="sm"
                    variant="light"
                    v-clipboard:copy="codes[currentIndex]"
                    v-clipboard:success="() => (isCopied = true)"
                >
                    <i class="fas ml-0 d-block" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                </b-button>
            </template>
        </b-tabs>
    </b-card>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/atom-one-dark.css';
import XML from 'highlight.js/lib/languages/xml';
import JavaScript from 'highlight.js/lib/languages/javascript';
import TypeScript from 'highlight.js/lib/languages/typescript';
import Shell from 'highlight.js/lib/languages/shell';

hljs.registerLanguage('shell', Shell);
hljs.registerLanguage('XML', XML);
hljs.registerLanguage('JavaScript', JavaScript);
hljs.registerLanguage('TypeScript', TypeScript);

@Component({})
export default class BaseCodeExample extends Vue {
    isCopied = false;
    currentIndex = 0;
    langMap = {
        JavaScript: 'js',
        TypeScript: 'ts',
        Shell: 'shell',
        XML: 'xml',
    };
    @Prop({ default: [] }) codes!: string[];
    @Prop() languages!: 'JavaScript' | 'TypeScript' | 'Shell' | 'XML';

    get codeExample() {
        if (!this.codes.length) return;
        const language = this.langMap[this.languages[this.currentIndex]];
        return hljs.highlight(this.codes[this.currentIndex], { language }).value;
    }
}
</script>
<style lang="scss">
.tabs.tabs-code {
    width: 100% !important;
    .nav-link {
        padding: 0.5rem;
    }
}
</style>
