import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Pool, Event, Identity, Client } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [body('event').isString().isLength({ min: 0, max: 50 }), body('identityUuid').isUUID()];

const controller = async (req: Request, res: Response) => {
    const { identityUuid, event } = req.body;
    const client = await Client.findOne({ clientId: req.auth.client_id });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await Pool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const identity = await Identity.findOne({ uuid: identityUuid });
    if (!identity) throw new NotFoundError('Could not find ID for uuid');

    await Event.create({ name: event, poolId: pool._id, identityId: identity._id });

    res.status(201).end();
};

export default { validation, controller };
