import { Request, Response } from 'express';
import { Webhook } from '@thxnetwork/api/models/Webhook';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Webhooks']
    const webhooks = await Webhook.find({ poolId: req.header('x-poolid') });
    res.json(webhooks);
};

export default { controller, validation };
