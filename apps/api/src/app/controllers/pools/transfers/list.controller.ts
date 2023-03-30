import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer, PoolTransferDocument } from '@thxnetwork/api/models/PoolTransfer';
import { v4 } from 'uuid';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    let poolTransfers = await PoolTransfer.find({ poolId: req.params.id });

    if (!poolTransfers.length) {
        const poolTransfer = await PoolTransfer.create({
            uuid: v4(),
            sub: req.auth.sub,
            poolId: pool._id,
            token: v4(),
            expiry: Date.now() + 1000 * 60 * 60 * 24 * 7, // t + 7 days
        });
        poolTransfers = [poolTransfer];
    }

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
