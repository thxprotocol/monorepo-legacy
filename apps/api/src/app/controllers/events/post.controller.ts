import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/api/models/Event';
import { Identity } from '@thxnetwork/api/models/Identity';

const validation = [body('uuid').isUUID(), body('event').isString().isLength({ min: 0, max: 10 })];

const controller = async (req: Request, res: Response) => {
    const { uuid, token } = req.body;
    const pool = await AssetPool.findOne({ token });
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const identity = await Identity.findOne({ uuid });
    if (!identity) throw new NotFoundError('Could not find ID for uuid');

    const event = await Event.create({ poolId: pool._id, identityId: identity._id });
    console.log(event);

    res.json();
};

export default { validation, controller };
