import { Request, Response } from 'express';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { body } from 'express-validator';
import WalletService from '@thxnetwork/api/services/WalletService';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [
    body('variant').isString(),
    body('uuid').isUUID(4),
    body('message').isString(),
    body('signature').isString(),
];

const controller = async (req: Request, res: Response) => {
    const { message, signature } = req.body;

    const wallet = await WalletService.findOne({ uuid: req.body.uuid });
    if (!wallet.sub) throw new BadRequestError('No wallet found not found for this uuid token.');

    // If no message and signature are present prepare a wallet to connect later
    const address = recoverSigner(message, signature);
    if (!address) throw new BadRequestError('No address recovered from signature.');

    await WalletService.connect({ uuid: req.body.uuid, address });

    res.status(201).end();
};

export default { validation, controller };
