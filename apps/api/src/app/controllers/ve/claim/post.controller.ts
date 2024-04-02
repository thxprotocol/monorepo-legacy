import { Request, Response } from 'express';
import { query } from 'express-validator';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [query('walletId').isMongoId()];

export const controller = async ({ wallet }: Request, res: Response) => {
    // Check if wallet has tokens to claim
    // TODO

    // Propose the claimTokens transaction
    const txs = await VoteEscrowService.claimTokens(wallet);

    res.status(201).json(txs);
};
export default { controller, validation };
