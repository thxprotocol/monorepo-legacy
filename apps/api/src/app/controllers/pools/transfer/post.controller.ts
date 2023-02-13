import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId(), body('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    const poolTransfer = await PoolTransfer.findOne({ sub: pool.sub, token: req.body.token });
    if (!poolTransfer) throw new NotFoundError('Could not find pool transfer');
    if (new Date(poolTransfer.expiry).getTime() > Date.now())
        throw new ForbiddenError('Pool transfer token has expired');

    await pool.updateOne({ sub: req.auth.sub });
    await poolTransfer.deleteOne();

    res.status(200).end();
};

export default { controller, validation };
