import axios from 'axios';
import { Pool } from '@thxnetwork/api/models';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { Identity } from '@thxnetwork/api/models/Identity';
import { WebhookRequest, WebhookRequestDocument } from '@thxnetwork/api/models/WebhookRequest';
import { Job } from '@hokify/agenda';
import { agenda } from '@thxnetwork/api/util/agenda';
import { signPayload } from '@thxnetwork/api/util/signingsecret';
import { JobType, Event, WebhookRequestState } from '@thxnetwork/common/enums';

async function create(webhook: WebhookDocument, sub: string, payload: { type: Event; data: any & { metadata: any } }) {
    const identities = (await Identity.find({ poolId: webhook.poolId, sub })).map((i) => i.uuid);
    const webhookRequest = await WebhookRequest.create({
        webhookId: webhook._id,
        payload: JSON.stringify({ ...payload, identities }),
        state: WebhookRequestState.Pending,
    });

    await agenda.now(JobType.RequestAttemp, { webhookRequestId: webhookRequest._id, poolId: webhook.poolId });
}

async function requestAttemptJob(job: Job) {
    let webhookRequest: WebhookRequestDocument;

    try {
        const { webhookRequestId, poolId } = job.attrs.data as any;
        const { signingSecret } = await Pool.findById(poolId);
        if (!signingSecret) throw new Error('No signing secret found');

        webhookRequest = await WebhookRequest.findById(webhookRequestId);
        if (!webhookRequest) throw new Error('No webhook request object found');
        const webhook = await Webhook.findById(webhookRequest.webhookId);
        if (!webhook) throw new Error('No webhook object found');

        const signature = signPayload(webhookRequest.payload, signingSecret);
        webhookRequest.state = WebhookRequestState.Sent;

        const res = await axios({
            method: 'POST',
            url: webhook.url,
            data: { signature, payload: webhookRequest.payload },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        webhookRequest.state = WebhookRequestState.Received;
        webhookRequest.httpStatus = res.status;

        console.debug(`[${res.status}], ${JSON.stringify(res.data)}`);
    } catch (error) {
        webhookRequest.state = WebhookRequestState.Failed;
        webhookRequest.failReason = error && error.toString();

        // If there is an HTTP response we store the HTTP error and status code
        if (error && error.response) {
            webhookRequest.httpStatus = error.response.status;
            webhookRequest.failReason = JSON.stringify(error.response.data);
        }

        console.error(error);
    } finally {
        webhookRequest.attempts = webhookRequest.attempts++;
        await webhookRequest.save();
    }
}

export default {
    create,
    requestAttemptJob,
};
