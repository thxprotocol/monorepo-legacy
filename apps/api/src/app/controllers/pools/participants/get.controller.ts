import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [
    param('id').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('page').optional().isString(),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');

    const { page, limit } = req.query;
    const participants = await PoolService.findParticipants(pool, Number(page), Number(limit));

    res.json(participants);
};

export default { controller, validation };
