import { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import SafeService, { Wallet } from '@thxnetwork/api/services/SafeService';

export const validation = [body('chainId').isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const chainId = NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat;
    const safeWallet = await SafeService.findPrimary(req.auth.sub, req.body.chainId);
    if (!safeWallet) throw new NotFoundError('Safe wallet not found.');

    // Find existing THX Smart Wallet so we can migrate assets
    const thxWallet = await Wallet.findOne({
        sub: req.auth.sub,
        chainId,
        version: '4.0.12',
        address: { $exists: true, $ne: '' },
        safeVersion: { $exists: false },
    });
    if (!thxWallet) throw new NotFoundError('THX wallet not found.');

    SafeService.transferAll(thxWallet, safeWallet);

    res.json(safeWallet);
};

export default { controller, validation };
