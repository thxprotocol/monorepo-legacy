import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import { body } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [body('variant').isString(), body('message').isString(), body('signature').isString()];

const controller = async (req: Request, res: Response) => {
    const { message, signature, variant } = req.body;
    const address = recoverSigner(message, signature);

    await WalletService.create(variant, {
        sub: req.auth.sub,
        address,
        chainId: getChainId(),
    });

    res.status(201).end();
};

export default { validation, controller };
