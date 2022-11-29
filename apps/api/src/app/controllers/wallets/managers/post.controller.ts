import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import WalletManagerService from '@thxnetwork/api/services/WalletManagerService';
import { Wallet } from '@thxnetwork/api/models/Wallet';

export const validation = [param('id').exists().isMongoId(), body('address').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const wallet = await Wallet.findById(req.params.id);

    if (!wallet) {
        throw new NotFoundError('Could not find the wallet');
    }
    const walletManager = await WalletManagerService.create(wallet, req.body.address);
    res.status(201).json(walletManager);
};

export default { controller, validation };
