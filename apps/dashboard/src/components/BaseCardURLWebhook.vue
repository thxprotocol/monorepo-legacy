<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-webhook
        >
            <strong>{{ title }}</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-webhook" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-muted">{{ description }}</p>
                <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: pre">
                    <b-button 
                        variant="light" 
                        v-clipboard:copy="code"
                        v-clipboard:success="() => isCopied = true" 
                        style="white-space: normal"
                        size="sm" 
                        class="mr-3">
                        <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                    </b-button>
                    <code class="language-shell" v-html="codeExample"></code>
                </pre>
                <slot name="alerts"></slot>
                <b-alert show variant="warning">
                    <i class="fas fa-exclamation-circle mr-2"></i> Do not make this webhook visible to the public and
                    implement it only in trusted backends.
                </b-alert>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import hljs from 'highlight.js/lib/core';
import Shell from 'highlight.js/lib/languages/shell';
import { Component, Prop, Vue } from 'vue-property-decorator';

hljs.registerLanguage('shell', Shell);

@Component({})
export default class BaseCardURLWebhook extends Vue {
    isCopied = false;
    isVisible = true;

    @Prop() code!: string;
    @Prop({ default: true }) visible!: boolean;
    @Prop() title!: string;
    @Prop() description!: string;

    get codeExample() {
        return hljs.highlight(this.code || '', { language: 'shell' }).value;
    }
}
</script>
