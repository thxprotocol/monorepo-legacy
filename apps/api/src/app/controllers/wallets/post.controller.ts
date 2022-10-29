import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { body } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';

export const validation = [
    body('sub').exists().isMongoId(),
    body('chainId').exists().isNumeric(),
    body('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new UnauthorizedError('Invalid account');

    // Force sync by default but allow the requester to do async calls.
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : true;
    const wallet = await WalletService.create(req.body.chainId, account, forceSync);

    res.status(201).json(wallet);
};

export default { controller, validation };
