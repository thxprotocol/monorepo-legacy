import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { Webhook } from '@thxnetwork/api/models/Webhook';

const validation = [param('id').isMongoId(), body('url').isURL({ require_tld: false })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Webhooks']
    const webhook = await Webhook.findByIdAndUpdate(req.params.id, { url: req.body.url }, { new: true });
    res.json(webhook);
};

export default { controller, validation };
