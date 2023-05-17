import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { v4 } from 'uuid';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { isAddress, toChecksumAddress } from 'web3-utils';
import { Widget } from '@thxnetwork/api/models/Widget';

const validation = [
    param('token').exists().isString(),
    body('address')
        .optional()
        .custom((address) => isAddress(address)),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets Webhook']
    //
    const pool = await AssetPool.findOne({ token: req.params.token });
    if (!pool) throw new ForbiddenError('Webhook token is not valid');

    const widget = await Widget.findOne({ poolId: pool._id });
    if (!widget || !widget.active) throw new NotFoundError('Could not find an active widget');

    const wallet = await Wallet.create({
        token: v4(),
        poolId: pool._id,
        chainId: pool.chainId,
        address: req.body.address ? toChecksumAddress(req.body.address) : '',
    });

    res.status(201).json({ walletId: wallet._id, walletURL: widget.domain + '?thx_widget_path=/w/' + wallet.token });
};

export default { controller, validation };
