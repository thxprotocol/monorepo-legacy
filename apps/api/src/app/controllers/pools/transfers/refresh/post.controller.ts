import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId(), body('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    let poolTransfer = await PoolTransfer.findOne({ sub: pool.sub, token: req.body.token });
    if (!poolTransfer) throw new NotFoundError('Could not find pool transfer');

    poolTransfer = await PoolTransfer.findByIdAndUpdate(
        poolTransfer._id,
        { expiry: Date.now() + 1000 * 60 * 60 * 24 * 30 }, // t + 30 days
        { new: true },
    );

    res.status(201).end();
};

export default { controller, validation };
