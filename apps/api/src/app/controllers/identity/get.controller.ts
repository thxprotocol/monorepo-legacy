import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { uuidV1 } from '@thxnetwork/api/util/uuid';
import { Identity } from '@thxnetwork/api/models/Identity';
import { Client } from '@thxnetwork/api/models/Client';
import { param } from 'express-validator';

const validation = [param('salt').isString().isLength({ min: 0 })];

const controller = async (req: Request, res: Response) => {
    const client = await Client.findOne({ clientId: req.auth.client_id });
    if (!client) throw new NotFoundError('Could not find client for token');

    const pool = await AssetPool.findById(client.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    // Derive uuid v1 from poolId + salt. Using uuid v1 format so we can validate the input using express-validator
    const poolId = String(pool._id);
    const uuid = uuidV1(`${poolId}${req.params.salt}`);
    const identity = await Identity.findOneAndUpdate({ poolId, uuid }, { poolId, uuid }, { new: true, upsert: true });

    res.json(identity.uuid);
};

export default { validation, controller };
