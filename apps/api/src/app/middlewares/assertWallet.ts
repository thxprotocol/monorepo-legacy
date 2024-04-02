import { Response, Request, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '../util/errors';
import WalletService from '../services/WalletService';

const assertWallet = async (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.query.walletId as string;

    if (walletId) {
        const wallet = await WalletService.findById(walletId);
        if (!wallet) throw new NotFoundError('Wallet not found');
        if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Wallet not owned by sub.');

        req.wallet = wallet;
    }

    next();
};

export { assertWallet };
