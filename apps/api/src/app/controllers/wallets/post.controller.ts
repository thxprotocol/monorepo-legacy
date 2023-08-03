import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [
    body('address').optional().isString(),
    body('sub').optional().isMongoId(),
    body('chainId').optional().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    let wallet = await Wallet.findOne({ address: req.params.address, chainId: req.body.chainId, sub: req.body.sub });
    if (wallet) throw new ForbiddenError('Wallet already exists');

    wallet = await SafeService.create({ chainId: req.body.chainId, sub: req.body.sub, address: req.body.address });

    res.status(200).json(wallet);
};

export default { controller, validation };
