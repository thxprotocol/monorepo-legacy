import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Pool } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    await Pool.deleteOne({ _id: pool._id });

    res.status(204).end();
};

export default { controller, validation };
