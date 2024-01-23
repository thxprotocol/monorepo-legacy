import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Identity } from '@thxnetwork/api/models/Identity';
import { uuidV1 } from '@thxnetwork/api/util/uuid';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const uuid = uuidV1();
    const id = await Identity.create({ poolId: pool._id, uuid });

    res.json(id.uuid);
};

export default { validation, controller };
