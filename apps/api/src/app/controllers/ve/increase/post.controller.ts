import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { BigNumber } from 'ethers';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [
    query('walletId').isMongoId(),
    body('amountInWei').optional().isString(),
    body('lockEndTimestamp').optional().isInt(),
];

export const controller = async ({ wallet, body }: Request, res: Response) => {
    // Check SmartWalletWhitelist
    const isApproved = await VoteEscrowService.isApprovedAddress(wallet.address, wallet.chainId);
    if (!isApproved) throw new ForbiddenError('Wallet address is not on whitelist.');

    const txList = [];
    if (body.amountInWei) {
        // Check sufficient BPTGauge approval
        const amount = await VoteEscrowService.getAllowance(
            wallet,
            contractNetworks[wallet.chainId].BPTGauge,
            contractNetworks[wallet.chainId].VotingEscrow,
        );
        if (BigNumber.from(amount).lt(body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

        // TODO Check sufficient balance
        const txs = await VoteEscrowService.increaseAmount(wallet, body.amountInWei);
        txList.push(txs);
    }

    if (body.lockEndTimestamp) {
        // Check lockEndTimestamp to be more than today + 90 days
        const { web3 } = getProvider();
        const latest = await web3.eth.getBlockNumber();
        const now = (await web3.eth.getBlock(latest)).timestamp;
        if (body.lockEndTimestamp < now) {
            throw new ForbiddenError('lockEndTimestamp needs be larger than today');
        }

        // Check if lockEndTimestamp is more than current lock end
        const lock = await VoteEscrowService.list(wallet);
        if (body.lockEndTimestamp < Number(lock.end)) {
            throw new ForbiddenError('lockEndTimestamp needs be larger than current lock end');
        }

        const txs = await VoteEscrowService.increaseUnlockTime(wallet, body.lockEndTimestamp);
        txList.push(txs);
    }

    res.status(201).json(txList);
};
export default { controller, validation };
