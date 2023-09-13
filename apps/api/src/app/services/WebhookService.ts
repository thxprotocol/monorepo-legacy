import axios from 'axios';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { WebhookRequest } from '@thxnetwork/api/models/WebhookRequest';
import { Job } from '@hokify/agenda';
import { agenda } from '@thxnetwork/api/util/agenda';
import { JobType } from '@thxnetwork/types/enums';
import { signPayload } from '@thxnetwork/api/util/signingsecret';
import { Event, WebhookRequestState } from '@thxnetwork/types/enums';

async function create(webhook: WebhookDocument, sub: string, payload: { type: Event; data: any }) {
    const wallets = (await Wallet.find({ poolId: webhook.poolId, sub })).map((w) => w.uuid);
    const webhookRequest = await WebhookRequest.create({
        webhookId: webhook._id,
        payload: JSON.stringify({ ...payload, wallets }),
        state: WebhookRequestState.Pending,
    });

    await agenda.now(JobType.RequestAttemp, { webhookRequestId: webhookRequest._id, poolId: webhook.poolId });
}

async function requestAttemptJob(job: Job) {
    const { webhookRequestId, poolId } = job.attrs.data as any;
    const { signingSecret } = await AssetPool.findById(poolId);
    if (!signingSecret) return;

    const webhookRequest = await WebhookRequest.findById(webhookRequestId);
    if (!webhookRequest) return;
    const webhook = await Webhook.findById(webhookRequest.webhookId);
    if (!webhook) return;

    try {
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
        if (error && error.response) {
            webhookRequest.httpStatus = error.response.status;
        }

        console.error(error, error.response.status);
    } finally {
        webhookRequest.attempts = webhookRequest.attempts++;
        await webhookRequest.save();
    }
}

export default {
    create,
    requestAttemptJob,
};
