import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { body } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '../../models/Wallet';
import { ChainId } from '@thxnetwork/api/types/enums';

export const validation = [
    body('sub').exists().isMongoId(),
    body('chainId').exists().isNumeric(),
    body('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    let wallet = await Wallet.findOne({ sub: String(req.body.sub), chainId: Number(req.body.chainId) as ChainId });
    if (wallet) {
        if (!wallet.address) throw new Error('No address found for this wallet.');
        return res.status(201).json(wallet);
    }

    wallet = await WalletService.create(req.body.chainId, account, true);

    res.status(201).json(wallet);
};

export default { controller, validation };
