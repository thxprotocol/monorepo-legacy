import { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, ForbiddenError } from '@thxnetwork/api/util/errors';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [body('chainId').isNumeric(), body('safeTxHash').isString(), body('signature').isString()];

const controller = async (req: Request, res: Response) => {
    // Find the primary wallet for this sub (containing an address)
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId: req.body.chainId });
    if (!wallet) throw new BadRequestError('Primary wallet not deployed yet.');
    if (req.auth.sub !== wallet.sub) throw new ForbiddenError('Wallet not owned by sub.');

    await SafeService.confirm(wallet, req.body.safeTxHash, req.body.signature);

    res.json(wallet);
};

export default { controller, validation };
