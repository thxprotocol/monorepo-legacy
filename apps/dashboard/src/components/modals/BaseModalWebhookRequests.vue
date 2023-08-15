<template>
    <base-modal size="xl" title="Recent Webhook Requests (50)" :id="id" :error="error">
        <template #modal-body>
            <b-row>
                <b-col md="6">
                    <p class="text-muted">Set up your webhook endpoint to receive live events from THX API.</p>
                    <pre
                        class="rounded p-3 mb-2 text-white w-auto"
                        style="background-color: #282c34; overflow: scroll; white-space: pre; tab-size: 2"
                    >
                        <code class="language-html" v-html="exampleController"></code>
                    </pre>
                </b-col>
                <b-col md="6">
                    <b-list-group>
                        <b-list-group-item
                            :key="key"
                            v-for="(webhookRequest, key) of webhookRequestList"
                            class="bg-light"
                        >
                            <div class="d-flex justify-content-between mb-2">
                                <code>POST {{ webhook.url }}</code>
                                <small class="text-muted" v-if="webhookRequest.createdAt">
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
                </b-col>
            </b-row>
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
    path = '';
    get example() {
        const path = new URL(this.webhook.url).pathname;
        return `
// Helper method to verify payload signature
function constructEvent(payload, signature, secret) {
	const hmac = crypto.createHmac('sha256', secret);
	hmac.update(payload);
    const calculatedSignature = hmac.digest('base64');
	if (signature !== calculatedSignature) throw new Error('Failed signature verification')
    return JSON.parse(payload);
}

// Sample endpoint controller (Express)
app.post('${path}', (req, res) => {
    let event;

    try {
        // Veries and parses the payload using the WEBHOOK_SIGNING_SECRET which you can get in Developer -> Webhooks
        event = constructEvent(req.body.payload, req.body.signature, WEBHOOK_SIGNING_SECRET);
    } catch (error) {
        return res.status(400).send("Webhook Error: " + err.message);
    }

    switch(event.type) {
        case 'reward_custom.paid': {
            // Handle the event
            // ...
            break
        }
        default : {
            console.log("Unhandled event type " + event.type)
        }
    }

    res.send();
});`;
    }

    @Prop() id!: string;
    @Prop() webhook!: TWebhook;
    @Prop() webhookRequests!: TWebhookRequest[];

    get exampleController() {
        return hljs.highlight(this.example, { language: 'javascript' }).value;
    }

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
