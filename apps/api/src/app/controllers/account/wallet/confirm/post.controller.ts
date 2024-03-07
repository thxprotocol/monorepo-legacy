import { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, ForbiddenError } from '@thxnetwork/api/util/errors';
import { Transaction } from '@thxnetwork/api/models';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [body('chainId').isNumeric(), body('safeTxHash').isString(), body('signature').isString()];

const controller = async (req: Request, res: Response) => {
    const tx = await Transaction.findOne({ safeTxHash: req.body.safeTxHash });
    if (!tx) throw new BadRequestError('Transaction no longer exists.');

    // Find the primary wallet for this sub
    const wallet = await SafeService.findById(tx.walletId);
    if (!wallet) throw new BadRequestError('Primary wallet not deployed yet.');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Wallet not owned by sub.');

    await SafeService.confirm(wallet, req.body.safeTxHash, req.body.signature);

    res.json(wallet);
};

export default { controller, validation };
