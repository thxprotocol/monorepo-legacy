import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { BigNumber } from 'ethers';
import { BPT_ADDRESS, VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import { getProvider } from '@thxnetwork/api/util/network';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [body('amountInWei').isString(), body('lockEndTimestamp').isInt()];

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    // Check sufficient BPT approval
    const amount = await VoteEscrowService.getAllowance(wallet, BPT_ADDRESS, VE_ADDRESS);
    if (BigNumber.from(amount).lt(req.body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

    // Check lockEndTimestamp to be more than today + 3 months
    const { web3 } = getProvider();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    if (now > req.body.lockEndTimestamp) throw new ForbiddenError('lockEndTimestamp needs be larger than today');

    // Check SmartWalletWhitelist
    const isApproved = await VoteEscrowService.isApprovedAddress(wallet.address);
    if (!isApproved) throw new ForbiddenError('Wallet address is not on whitelist.');

    // Deposit funds for wallet
    const txs = await VoteEscrowService.deposit(wallet, req.body.amountInWei, req.body.lockEndTimestamp);

    res.status(201).json(txs);
};
export default { controller, validation };
