import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

export const validation = [
    param('id').exists(),
    body('archived').optional().isBoolean(),
    body('title').optional().isString(),
    body('discordWebhookUrl').optional({ checkFalsy: true }).isURL(),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find the Asset Pool for this id');
    const result = await AssetPool.findByIdAndUpdate(pool._id, req.body, { new: true });
    return res.json(result);
};
export default { controller, validation };
