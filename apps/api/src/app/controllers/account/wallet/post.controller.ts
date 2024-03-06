import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { body } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [
    body('variant').isString(),
    body('message').optional().isString(),
    body('signature').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const { message, signature, variant } = req.body;
    const data: Partial<TWallet> = { sub: req.auth.sub };

    // If no message and signature are present prepare a wallet to connect later
    if (signature && message) {
        data.address = recoverSigner(message, signature);
    }

    await WalletService.create(variant, data);

    res.status(201).end();
};

export default { validation, controller };
