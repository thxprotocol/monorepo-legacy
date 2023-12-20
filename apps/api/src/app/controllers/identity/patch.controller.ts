import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Identity } from '@thxnetwork/api/models/Identity';
import { param } from 'express-validator';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const pool = await AssetPool.findById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool.');

    const identity = await Identity.findOneAndUpdate({ uuid: req.params.uuid }, { sub: req.auth.sub }, { new: true });

    res.json(identity);
};

export default { validation, controller };
