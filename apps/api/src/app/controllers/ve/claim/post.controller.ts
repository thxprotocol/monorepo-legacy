import { Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { query } from 'express-validator';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Wallet not owned by sub.');

    // Check if wallet has tokens to claim
    // TODO

    // Propose the claimTokens transaction
    const txs = await VoteEscrowService.claimTokens(wallet);

    res.status(201).json(txs);
};
export default { controller, validation };
