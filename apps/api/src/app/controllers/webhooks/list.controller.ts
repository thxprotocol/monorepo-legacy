import { Request, Response } from 'express';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { WebhookRequest } from '@thxnetwork/api/models/WebhookRequest';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Webhooks']
    const poolId = req.header('x-poolid');
    const webhooks = await Webhook.find({ poolId });
    const response = await Promise.all(
        webhooks.map(async (webhook: WebhookDocument) => {
            const webhookRequests = await WebhookRequest.find({ poolId, webhookId: webhook._id });
            return {
                ...webhook.toJSON(),
                webhookRequests,
            };
        }),
    );
    res.json(response);
};

export default { controller, validation };
