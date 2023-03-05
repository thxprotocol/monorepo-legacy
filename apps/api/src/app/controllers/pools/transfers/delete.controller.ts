import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    const poolTransfer = await PoolTransfer.findOne({ sub: pool.sub, token: req.body.token });
    if (!poolTransfer) throw new NotFoundError('Could not find pool transfer');

    await poolTransfer.deleteOne();

    res.status(200).end();
};

export default { controller, validation };
