import { Request, Response } from 'express';
import { param } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { currentVersion } from '@thxnetwork/contracts/exports';

export const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new UnauthorizedError('Account not found for this sub.');

    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (req.auth.sub !== wallet.sub) throw new ForbiddenError('Wallet not owned by sub.');

    const tx = await WalletService.upgrade(wallet, currentVersion);
    res.status(200).json(tx);
};

export default { controller, validation };
