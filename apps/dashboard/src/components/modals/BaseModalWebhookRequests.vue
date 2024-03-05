<template>
    <base-modal size="xl" title="Recent Webhook Requests (Last 50)" :id="id" :error="error">
        <template #modal-body>
            <b-row>
                <b-col md="6">
                    <b-list-group>
                        <b-list-group-item
                            :key="key"
                            v-for="(webhookRequest, key) of webhookRequestList"
                            class="bg-light p-2"
                        >
                            <div class="d-flex justify-content-between mb-2">
                                <div>
                                    <b-badge
                                        class="p-1 mr-2"
                                        :variant="
                                            webhookRequest.httpStatus > 400 && webhookRequest.httpStatus < 600
                                                ? 'danger'
                                                : 'success'
                                        "
                                    >
                                        {{ webhookRequest.httpStatus }}
                                    </b-badge>
                                    <code>POST {{ webhook.url }}</code>
                                </div>
                                <small class="text-muted" v-if="webhookRequest.createdAt">
                                    {{ format(new Date(webhookRequest.createdAt), 'dd-MM-yyyy HH:mm') }}
                                </small>
                            </div>
                            <pre
                                v-if="webhookRequest.payloadFormatted"
                                class="rounded p-3 mb-0 w-100 text-white small"
                                style="background-color: #282c34; white-space: pre-line"
                            >
                                <code class="language-html" v-html="webhookRequest.payloadFormatted.value"></code>
                            </pre>
                            <b-alert show class="p-1 m-0 mt-2 small" variant="gray">
                                {{ WebhookRequestState[webhookRequest.state] }}
                                <template v-if="webhookRequest.failReason">: {{ webhookRequest.failReason }}</template>
                            </b-alert>
                        </b-list-group-item>
                    </b-list-group>
                </b-col>
                <b-col md="6">
                    <p class="text-muted">Set up your webhook endpoint to receive live events from THX API.</p>
                    <b-link href="https://docs.thx.network/developers/webhooks" target="_blank">View Examples</b-link>
                    <!-- <pre
                        class="rounded p-3 mb-2 text-white w-auto small"
                        style="background-color: #282c34; overflow: scroll; white-space: pre; tab-size: 2"
                    >
                        <code class="language-html" v-html="exampleController"></code>
                    </pre> -->
                </b-col>
            </b-row>
        </template>
        <template #btn-primary> &nbsp; </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import hljs from 'highlight.js/lib/core';
import JavaScript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/atom-one-dark.css';
import { format } from 'date-fns';
import { WebhookRequestState } from '@thxnetwork/common/enums';

hljs.registerLanguage('javascript', JavaScript);

@Component({
    components: {
        BaseModal,
    },
})
export default class ModalWebhookRequests extends Vue {
    format = format;
    WebhookRequestState = WebhookRequestState;
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
