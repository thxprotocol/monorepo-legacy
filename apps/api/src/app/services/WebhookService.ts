import axios from 'axios';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { WebhookRequest, WebhookRequestDocument } from '@thxnetwork/api/models/WebhookRequest';
import { Job } from '@hokify/agenda';
import { agenda } from '@thxnetwork/api/util/agenda';
import { JobType } from '@thxnetwork/types/enums';
import { signPayload } from '@thxnetwork/api/util/signingsecret';
import { Event, WebhookRequestState } from '@thxnetwork/types/enums';

async function create(webhook: WebhookDocument, sub: string, payload: { type: Event; data: any & { metadata: any } }) {
    const wallets = (await Wallet.find({ poolId: webhook.poolId, sub })).map((w) => w.uuid);
    const webhookRequest = await WebhookRequest.create({
        webhookId: webhook._id,
        payload: JSON.stringify({ ...payload, wallets }),
        state: WebhookRequestState.Pending,
    });

    await agenda.now(JobType.RequestAttempt, { webhookRequestId: webhookRequest._id, poolId: webhook.poolId });
}

async function requestAttemptJob(job: Job) {
    let webhookRequest: WebhookRequestDocument;

    try {
        const { webhookRequestId, poolId } = job.attrs.data as any;
        const { signingSecret } = await AssetPool.findById(poolId);
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
