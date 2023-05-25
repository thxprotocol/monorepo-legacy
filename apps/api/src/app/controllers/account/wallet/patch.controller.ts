import { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [body('code').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    let wallet = await Wallet.findOne({ uuid: req.body.code });
    if (!wallet || (wallet.sub && wallet.sub !== req.auth.sub)) {
        throw new ForbiddenError('You dont have access to this wallet');
    }

    // Find the primary wallet for this sub (containing an address)
    const primaryWallet = await WalletService.findPrimary(req.auth.sub, wallet.chainId);
    if (!primaryWallet) throw new BadRequestError('Primary wallet not deployed yet.');

    wallet = await WalletService.transferOwnership(wallet, primaryWallet);

    res.json(wallet);
};

export default { controller, validation };
