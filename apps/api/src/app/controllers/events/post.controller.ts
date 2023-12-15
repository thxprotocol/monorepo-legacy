import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/api/models/Event';
import { Identity } from '@thxnetwork/api/models/Identity';

const validation = [
    body('apiKey').isUUID(),
    body('identityUuid').isUUID(),
    body('event').isString().isLength({ min: 0, max: 10 }),
];

const controller = async (req: Request, res: Response) => {
    const { identityUuid, event, token } = req.body;

    const pool = await AssetPool.findOne({ token });
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const identity = await Identity.findOne({ uuid: identityUuid });
    if (!identity) throw new NotFoundError('Could not find ID for uuid');

    await Event.create({ name: event, poolId: pool._id, identityUuid: identityUuid });

    res.json();
};

export default { validation, controller };
