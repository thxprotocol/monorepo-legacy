import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { BigNumber } from 'ethers';
import SafeService from '@thxnetwork/api/services/SafeService';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [body('amountInWei').isString(), body('lockEndTimestamp').isISO8601()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    // Check sufficient BPT approval
    const amount = await VoteEscrowService.getBPTAllowance(wallet);
    if (BigNumber.from(amount).lt(req.body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

    // Check lockEndTimestamp to be more than today
    const lockEndTimestamp = new Date(req.body.lockEndTimestamp).getTime();
    if (Date.now() > lockEndTimestamp) throw new ForbiddenError('lockEndTimestamp needs be larger than today');

    // Deposit funds for wallet
    const tx = await VoteEscrowService.deposit(wallet, req.body.amountInWei, lockEndTimestamp);

    res.status(201).json(tx);
};
export default { controller, validation };
