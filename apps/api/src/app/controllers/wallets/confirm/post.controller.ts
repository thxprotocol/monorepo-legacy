import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService, { Wallet } from '@thxnetwork/api/services/SafeService';

export const validation = [param('id').isMongoId(), body('safeTxHash').isString(), body('signature').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const account = await AccountProxy.getById(req.auth.sub);
    if (!account) throw new UnauthorizedError('No account found for this sub.');

    // Find the primary wallet for this sub (containing an address)
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) throw new BadRequestError('Primary wallet not deployed yet.');

    await SafeService.confirm(wallet, req.body.safeTxHash, req.body.signature);

    res.json(wallet);
};

export default { controller, validation };
