import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/api/models/Event';
import { paginatedResults } from '@thxnetwork/api/util/pagination';

const validation = [query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const pool = await AssetPool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const result = await paginatedResults(Event, Number(req.query.page), Number(req.query.limit), {
        poolId: pool._id,
    });

    res.json(result);
};

export default { validation, controller };
