import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';
import ERC20 from '@thxnetwork/api/models/ERC20';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

const validation = [param('id').isMongoId(), body('sub').isMongoId(), body('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find pool for this ID');

    const poolTransfer = await PoolTransfer.findOne({ sub: pool.sub, token: req.body.token });
    if (!poolTransfer) throw new NotFoundError('Could not find pool transfer');

    if (new Date(poolTransfer.expiry).getTime() < Date.now()) {
        throw new ForbiddenError('Pool transfer token has expired');
    }

    if (poolTransfer.poolId !== String(pool._id)) {
        throw new ForbiddenError('Transfer token is not meant for this pool.');
    }

    const erc20ids = await ERC20Perk.find({ poolId: pool._id }).distinct('erc20Id');

    pool.sub = req.body.sub;
    await pool.save();

    for (let i = 0; i < erc20ids.length; i++) {
        const erc20 = await ERC20.findById(erc20ids[i]);
        await ERC20Service.findOrImport(pool, erc20.address);
    }

    await poolTransfer.deleteOne();

    res.status(200).end();
};

export default { controller, validation };
