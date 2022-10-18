import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { body } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';

export const validation = [body('chainId').exists().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) {
        throw new UnauthorizedError('Invalid account');
    }
    const wallet = await WalletService.create(req.body.chainId, account);
    res.status(201).json(wallet);
};

export default { controller, validation };
