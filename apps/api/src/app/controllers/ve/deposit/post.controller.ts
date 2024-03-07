import { Request, Response } from 'express';
import { body, query } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { BigNumber } from 'ethers';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    body('amountInWei').isString(),
    body('lockEndTimestamp').isInt(),
    query('walletId').isMongoId(),
];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    // Check sufficient BPTGauge approval
    const amount = await VoteEscrowService.getAllowance(
        wallet,
        contractNetworks[wallet.chainId].BPTGauge,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    if (BigNumber.from(amount).lt(req.body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

    // Check lockEndTimestamp to be more than today + 3 months
    const { web3 } = getProvider();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;
    if (now > req.body.lockEndTimestamp) throw new ForbiddenError('lockEndTimestamp needs be larger than today');

    // Check SmartWalletWhitelist
    const isApproved = await VoteEscrowService.isApprovedAddress(wallet.address, wallet.chainId);
    if (!isApproved) throw new ForbiddenError('Wallet address is not on whitelist.');

    // Deposit funds for wallet
    const txs = await VoteEscrowService.deposit(wallet, req.body.amountInWei, req.body.lockEndTimestamp);

    res.status(201).json(txs);
};
export default { controller, validation };
