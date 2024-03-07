import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { BadRequestError, ForbiddenError } from '@thxnetwork/api/util/errors';
import { Transaction } from '@thxnetwork/api/models';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [
    body('chainId').isNumeric(),
    body('safeTxHash').isString(),
    body('signature').isString(),
    query('walletId').isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await SafeService.findById(walletId);
    if (!wallet) throw new BadRequestError('Wallet not found.');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Wallet not owned by sub.');

    const tx = await Transaction.findOne({ safeTxHash: req.body.safeTxHash });
    if (!tx) throw new BadRequestError('Transaction not found.');

    await SafeService.confirm(wallet, req.body.safeTxHash, req.body.signature);

    res.json(wallet);
};

export default { controller, validation };
