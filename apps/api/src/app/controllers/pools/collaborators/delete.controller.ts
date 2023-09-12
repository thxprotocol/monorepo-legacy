import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Collaborator } from '@thxnetwork/api/models/Collaborator';

export const validation = [param('id').isMongoId(), param('sub').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this');
    if (req.body.sub === pool.sub) throw new ForbiddenError('Can not remove campaign owner');

    await Collaborator.deleteOne({ poolId: pool._id, sub: req.body.sub });

    res.status(204).end();
};

export default { controller, validation };
