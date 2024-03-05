import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event, EventDocument } from '@thxnetwork/api/models/Event';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Identity } from '@thxnetwork/api/models/Identity';
import { Pool } from '@thxnetwork/api/models';

const validation = [query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const result = await paginatedResults(Event, Number(req.query.page), Number(req.query.limit), {
        poolId: pool._id,
    });

    result.results = await Promise.all(
        result.results.map(async (event: EventDocument) => {
            const identity = await Identity.findById(event.identityId);
            return { ...event.toJSON(), identity };
        }),
    );

    res.json(result);
};

export default { validation, controller };
