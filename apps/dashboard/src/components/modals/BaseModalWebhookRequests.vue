<template>
    <base-modal size="xl" title="Recent Webhook Requests (50)" :id="id" :error="error">
        <template #modal-body>
            <b-list-group>
                <b-list-group-item :key="key" v-for="(webhookRequest, key) of webhookRequestList" class="bg-light">
                    <div class="d-flex justify-content-between mb-2">
                        <code>POST {{ webhook.url }}</code>
                        <small class="text-muted">
                            {{ format(new Date(webhookRequest.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </div>
                    <pre
                        v-if="webhookRequest.payloadFormatted"
                        class="rounded p-3 mb-2 w-100 text-white"
                        style="background-color: #282c34; white-space: pre-line"
                    >
                        <code class="language-html" v-html="webhookRequest.payloadFormatted.value"></code>
                    </pre>
                </b-list-group-item>
            </b-list-group>
        </template>
        <template #btn-primary> &nbsp; </template>
    </base-modal>
</template>

<script lang="ts">
import type { TWebhook, TWebhookRequest } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import hljs from 'highlight.js/lib/core';
import JavaScript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-dark.css';
import { format } from 'date-fns';
hljs.registerLanguage('javascript', JavaScript);

@Component({
    components: {
        BaseModal,
    },
})
export default class ModalWebhookRequests extends Vue {
    format = format;
    error = '';

    @Prop() id!: string;
    @Prop() webhook!: TWebhook;
    @Prop() webhookRequests!: TWebhookRequest[];

    get webhookRequestList() {
        return this.webhookRequests.map((request) => {
            request.payloadFormatted = hljs.highlight(request.payload, { language: 'javascript' });
            return request;
        });
    }

    onSubmit() {
        //
    }
}
</script>
