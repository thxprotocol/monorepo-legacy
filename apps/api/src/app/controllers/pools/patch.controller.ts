import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';

export const validation = [param('id').exists(), body('archived').exists().isBoolean()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await AssetPoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find the Asset Pool for this id');
    const result = await AssetPool.findByIdAndUpdate(pool._id, { archived: req.body.archived }, { new: true });
    return res.json(result);
};
export default { controller, validation };
