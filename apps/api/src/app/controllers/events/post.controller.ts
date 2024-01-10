import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Event } from '@thxnetwork/api/models/Event';
import { Identity } from '@thxnetwork/api/models/Identity';
import { Client } from '@thxnetwork/api/models/Client';

const validation = [body('event').isString().isLength({ min: 0, max: 50 }), body('identityUuid').isUUID(1)];

const controller = async (req: Request, res: Response) => {
    const { identityUuid, event } = req.body;
    const client = await Client.findOne({ clientId: req.auth.client_id });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await AssetPool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const identity = await Identity.findOne({ uuid: identityUuid });
    if (!identity) throw new NotFoundError('Could not find ID for uuid');

    await Event.create({ name: event, poolId: pool._id, identityId: identity._id });

    res.status(201).end();
};

export default { validation, controller };
