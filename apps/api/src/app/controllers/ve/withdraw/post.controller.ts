import { Request, Response } from 'express';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { body, query } from 'express-validator';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';

export const validation = [
    query('walletId').isMongoId(),
    body('isEarlyAttempt')
        .isBoolean()
        .customSanitizer((val: string) => (val ? JSON.parse(val) : false)),
];

export const controller = async ({ wallet, body }: Request, res: Response) => {
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
    if (!body.isEarlyAttempt && isEarlyWithdraw) throw new ForbiddenError('Funds are locked');

    // Propose the withdraw transaction
    const txs = await VoteEscrowService.withdraw(wallet, isEarlyWithdraw);

    res.status(201).json(txs);
};
export default { controller, validation };
