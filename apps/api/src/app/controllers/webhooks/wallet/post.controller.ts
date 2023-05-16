import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { v4 } from 'uuid';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

const validation = [param('token').exists().isString(), body('address').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets Webhook']
    //
    const pool = await AssetPool.findOne({ token: req.params.token });
    if (!pool) throw new ForbiddenError('Webhook does not exist.');

    const wallet = await Wallet.create({ chainId: pool.chainId, address: req.body.address, token: v4() });

    res.status(201).json(wallet);
};

export default { controller, validation };
