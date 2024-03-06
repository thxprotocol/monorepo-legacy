import { Request, Response } from 'express';
import { Pool, Client } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [param('salt').isString().isLength({ min: 0 })];

const controller = async (req: Request, res: Response) => {
    const client = await Client.findOne({ clientId: req.auth.client_id });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await Pool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const identity = await IdentityService.getIdentityForSalt(pool, req.params.salt);

    res.json(identity.uuid);
};

export default { validation, controller };
