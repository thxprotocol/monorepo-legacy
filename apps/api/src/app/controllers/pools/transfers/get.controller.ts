import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    console.log('SONO QUIIIII----------------------------------', { poolId: req.params.id, uuid: req.params.uuid });
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');
    console.log('POOOL TRAVATA');
    const poolTransfer = await PoolTransfer.findOne({ uuid: req.params.uuid });
    if (!poolTransfer) throw new NotFoundError('Could not find the pool transfer for this ID');

    res.json(poolTransfer.toJSON());
};

export default { controller, validation };
