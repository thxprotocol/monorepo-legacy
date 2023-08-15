import { body } from 'express-validator';
import { Request, Response } from 'express';
import { Webhook } from '@thxnetwork/api/models/Webhook';

const validation = [body('url').isURL({ require_tld: false })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Webhooks']
    const webhook = await Webhook.create({
        poolId: req.header('x-poolid'),
        url: req.body.url,
    });

    res.status(201).json({ ...webhook.toJSON(), webhookRequests: [] });
};

export default { controller, validation };
