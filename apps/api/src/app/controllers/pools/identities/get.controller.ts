import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId(), query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const identities = await PoolService.findIdentities(pool, page, limit);

    res.json(identities);
};

export default { validation, controller };
