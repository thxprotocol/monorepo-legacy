import { Request, Response } from 'express';
import { param } from 'express-validator';
import WalletManager from '@thxnetwork/api/models/WalletManager';
import Wallet from '@thxnetwork/api/models/Wallet';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@thxnetwork/api/util/errors';

export const validation = [param('id').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const walletManager = await WalletManager.findById(req.params.id);
    if (!walletManager) {
        return res.status(200).end();
    }
    const wallet = await Wallet.findById(walletManager.walletId);
    if (!wallet) {
        throw new NotFoundError('Could not found the Wallet');
    }
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Operation not allowed for this user');

    await WalletManager.findByIdAndRemove(walletManager._id);
    return res.status(204).end();
};

export default { controller, validation };
