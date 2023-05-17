import { Request, Response } from 'express';
import WalletService from '@thxnetwork/api/services/WalletService';
import { body } from 'express-validator';
import { Wallet } from '../../models/Wallet';

export const validation = [
    body('sub').optional().isMongoId(),
    body('chainId').exists().isNumeric(),
    body('address').optional().isString(),
    body('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const { sub, chainId, address, forceSync } = req.body;
    const query = {};
    if (sub) query['sub'] = sub;
    if (chainId) query['chainId'] = Number(chainId);
    if (address) query['address'] = address;

    let wallet = await Wallet.findOne(query);
    if (!wallet) {
        wallet = await WalletService.create({ sub, chainId, address, forceSync });
    }
    return res.status(201).json(wallet);
};

export default { controller, validation };
