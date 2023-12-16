import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/api/models/Event';

const validation = [body('uuid').isUUID(), body('event').isString().isLength({ min: 0, max: 10 })];

const controller = async (req: Request, res: Response) => {
    const pool = await AssetPool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const eventNames = await Event.find({ poolId: pool._id }).distinct('name');

    res.json(eventNames);
};

export default { validation, controller };
