import { Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { body, query } from 'express-validator';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';
import WalletService from '@thxnetwork/api/services/WalletService';

export const validation = [
    query('walletId').isMongoId(),
    body('isEarlyAttempt')
        .isBoolean()
        .customSanitizer((val: string) => (val ? JSON.parse(val) : false)),
];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Wallet not owned by sub.');

    // Check sufficient BPT approval
    const { web3 } = getProvider();
    const ve = new web3.eth.Contract(
        contractArtifacts['VotingEscrow'].abi,
        contractNetworks[wallet.chainId].VotingEscrow,
    );
    const lock = await ve.methods.locked(wallet.address).call();
    const now = (await web3.eth.getBlock('latest')).timestamp;

    // Check if client requests early exit and end date has not past
    const isEarlyWithdraw = Number(lock.end) > Number(now);
    if (!req.body.isEarlyAttempt && isEarlyWithdraw) throw new ForbiddenError('Funds are locked');

    // Propose the withdraw transaction
    const txs = await VoteEscrowService.withdraw(wallet, isEarlyWithdraw);

    res.status(201).json(txs);
};
export default { controller, validation };
