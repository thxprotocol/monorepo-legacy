import { Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

export const validation = [body('chainId').isNumeric(), body('safeTxHash').isString(), body('signature').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    // Find the primary wallet for this sub (containing an address)
    const wallet = await SafeService.findPrimary(req.auth.sub, req.body.chainId);
    if (!wallet) throw new BadRequestError('Primary wallet not deployed yet.');
    if (req.auth.sub !== wallet.sub) throw new ForbiddenError('Wallet not owned by sub.');

    await SafeService.confirm(wallet, req.body.safeTxHash, req.body.signature);

    res.json(wallet);
};

export default { controller, validation };
