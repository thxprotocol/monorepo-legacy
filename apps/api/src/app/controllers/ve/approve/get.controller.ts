import { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import SafeService from '@thxnetwork/api/services/SafeService';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [
    body('tokenAddress').isEthereumAddress(),
    body('spender').isEthereumAddress(),
    body('amountInWei').isString(),
];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const allowance = await VoteEscrowService.getAllowance(wallet, req.body.tokenAddress, req.body.spender);
    res.json(String(allowance));
};
export default { controller, validation };
