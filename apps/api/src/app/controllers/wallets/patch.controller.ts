import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { UnauthorizedError } from '@thxnetwork/api/util/errors';
import { Wallet } from '@thxnetwork/api/models/Wallet';

export const validation = [
    param('id').exists().isMongoId(),
    body('sub').optional().isMongoId(),
    body('chainId').optional().isNumeric(),
    body('address').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.body.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    const { sub, chainId, address } = req.body;
    const wallet = await Wallet.findByIdAndUpdate(req.params.id, { chainId, address, sub }, { new: true });

    return res.json(wallet);
};

export default { controller, validation };
