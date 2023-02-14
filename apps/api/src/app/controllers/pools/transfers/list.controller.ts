import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer, PoolTransferDocument } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    const poolTransfers = await PoolTransfer.find({ poolId: req.params.id });

    res.json(
        poolTransfers.map((poolTransfer: PoolTransferDocument) => {
            return {
                ...poolTransfer.toJSON(),
                isExpired: new Date(poolTransfer.expiry).getTime() < Date.now(),
                isTransferred: req.auth.sub !== poolTransfer.sub,
            };
        }),
    );
};

export default { controller, validation };
