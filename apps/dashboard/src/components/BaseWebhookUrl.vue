<template>
    <div>
        <p class="text-gray">
            Milestone rewards incentive your existing users to attract new users and will drive down your
            customer acquisition costs.
        </p>
        <strong>Code</strong>
        <p class="text-muted">
            Make a post call to this url to generate a webhook that will qualify the reward
        </p>
        <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: nowrap">
                <b-button 
                  variant="light" 
                    v-clipboard:copy="code"
                    v-clipboard:success="() => isCopied = true" size="sm" class="mr-3">
                    <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                </b-button>
                <code class="language-html" v-html="codeExample"></code>
        </pre>
    </div>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import XML from 'highlight.js/lib/languages/xml';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

hljs.registerLanguage('xml', XML);

@Component({})
export default class BaseWebhookUrl extends Vue {
    isCopied = false

    @Prop() code!: string;

    get codeExample() {
        return hljs.highlight(this.code || '', { language: 'xml' }).value;
    }

}

</script>