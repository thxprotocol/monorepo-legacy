import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { body } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '../../models/Wallet';

export const validation = [
    body('sub').exists().isMongoId(),
    body('chainId').exists().isNumeric(),
    body('address').optional().isString(),
    body('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    const { sub, chainId, address, forceSync } = req.body;
    const query = {};
    if (sub) query['sub'] = sub;
    if (chainId) query['chainId'] = Number(chainId);
    if (address) query['address'] = address;

    let wallet = await Wallet.findOne(query);
    if (!wallet) {
        wallet = await WalletService.create({ account, chainId, address, forceSync });
    }

    return res.status(201).json(wallet);
};

export default { controller, validation };
