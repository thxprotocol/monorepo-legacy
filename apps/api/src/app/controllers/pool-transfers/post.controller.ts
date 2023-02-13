import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';
import { v4 } from 'uuid';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    // Create a pool transfer
    const poolTransfer = await PoolTransfer.create({
        sub: req.auth.sub,
        poolId: pool._id,
        token: v4(),
        expiry: Date.now() + 1000 * 60 * 60 * 24 * 7, // n + 7 days
    });

    res.status(201).json(poolTransfer);
};

export default { controller, validation };
