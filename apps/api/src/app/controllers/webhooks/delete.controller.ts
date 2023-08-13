import { param } from 'express-validator';
import { Request, Response } from 'express';
import { Webhook } from '@thxnetwork/api/models/Webhook';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Webhooks']
    await Webhook.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
