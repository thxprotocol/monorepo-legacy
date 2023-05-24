import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import MilestoneRewardService from '@thxnetwork/api/services/MilestoneRewardService';

export const validation = [body('token').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    const wallet = await Wallet.findOne({ token: req.body.token });
    if (!wallet || (wallet.sub && wallet.sub !== req.auth.sub)) {
        throw new ForbiddenError('You dont have access to this wallet');
    }

    await wallet.updateOne({ sub: req.auth.sub });
    await MilestoneRewardService.updateWalletId(wallet, req.auth.sub);

    return res.json(wallet);
};

export default { controller, validation };
