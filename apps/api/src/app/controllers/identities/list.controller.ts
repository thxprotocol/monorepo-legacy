import { Request, Response } from 'express';
import { Pool, Client } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { query } from 'express-validator';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [query('code').isUUID(), query('clientId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const client = await Client.findOne({ clientId: req.query.clientId });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await Pool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const identity = await IdentityService.findIdentity(req.query.code as string);
    if (!identity) throw new NotFoundError('Could not find identity for code');

    res.json(identity);
};

export default { validation, controller };
