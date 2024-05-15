import { Request, Response } from 'express';
import { query } from 'express-validator';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

const validation = [query('walletId').isMongoId()];

const controller = async ({ wallet }: Request, res: Response) => {
    // TODO Check if wallet has tokens to claim
    // Propose the claimTokens transaction
    const txs = await VoteEscrowService.claimTokens(wallet);

    res.status(201).json(txs);
};
export { controller, validation };
