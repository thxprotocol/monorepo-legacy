import { Request, Response } from 'express';
import { Pool, Identity, Client } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { uuidV1 } from '@thxnetwork/api/util/uuid';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const client = await Client.findOne({ clientId: req.auth.client_id });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await Pool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const uuid = uuidV1();
    const id = await Identity.create({ poolId: pool._id, uuid });

    res.json(id.uuid);
};

export default { validation, controller };
