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
    if (!account) throw new UnauthorizedError('Invalid account');
    let wallet = await Wallet.findOne({ sub: String(req.body.sub), chainId: Number(req.body.chainId) as ChainId });
    if (wallet) {
        if (!wallet.address) {
            throw new Error('Wallet address not set');
        }
        return res.status(201).json(wallet);
    }
    // Force sync by default but allow the requester to do async calls.
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : true;
    wallet = await WalletService.create(req.body.chainId, account, forceSync);

    res.status(201).json(wallet);
};

export default { controller, validation };
