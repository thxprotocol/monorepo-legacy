import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { v4 } from 'uuid';
import { Identity } from '@thxnetwork/api/models/Identity';

const validation = [body('token').isUUID()];

const controller = async (req: Request, res: Response) => {
    const { token } = req.body;
    const pool = await AssetPool.findOne({ token });
    if (!pool) throw new NotFoundError('Could not find pool for token');

    const id = await Identity.create({ poolId: pool._id, uuid: v4() });

    res.json({ uuid: id.uuid });
};

export default { validation, controller };
