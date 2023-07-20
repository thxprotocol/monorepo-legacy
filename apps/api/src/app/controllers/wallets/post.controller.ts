import { Request, Response } from 'express';
import { body } from 'express-validator';
import SafeService, { Wallet } from '@thxnetwork/api/services/SafeService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [
    body('sub').exists().isMongoId(),
    body('chainId').exists().isNumeric(),
    body('address').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const { sub, chainId, address } = req.body;
    const query = {};
    if (sub) query['sub'] = sub;
    if (chainId) query['chainId'] = Number(chainId);
    if (address) query['address'] = address;

    let wallet = await Wallet.findOne(query);
    if (!wallet) {
        const account = await AccountProxy.getById(sub);
        wallet = await SafeService.create({ sub, chainId, address }, account.address);
    }

    return res.status(201).json(wallet);
};

export default { controller, validation };
