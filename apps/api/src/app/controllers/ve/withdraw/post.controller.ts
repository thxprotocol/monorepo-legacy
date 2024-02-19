import { Request, Response } from 'express';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import { body } from 'express-validator';
import SafeService from '@thxnetwork/api/services/SafeService';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';
import { getChainId } from '@thxnetwork/api/services/ContractService';

export const validation = [
    body('isEarlyAttempt')
        .isBoolean()
        .customSanitizer((val: string) => (val ? JSON.parse(val) : false)),
];

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    // Check sufficient BPT approval
    const { web3 } = getProvider();
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);
    const [lock, latest] = await Promise.all([ve.methods.locked(wallet.address).call(), web3.eth.getBlockNumber()]);
    const now = (await web3.eth.getBlock(latest)).timestamp;

    // Check if client requests early exit and end date has not past
    const isEarlyWithdraw = Number(lock.end) > Number(now);
    if (!req.body.isEarlyAttempt && isEarlyWithdraw) throw new ForbiddenError('Funds are locked');

    // Propose the withdraw transaction
    const txs = await VoteEscrowService.withdraw(wallet, isEarlyWithdraw);

    res.status(201).json(txs);
};
export default { controller, validation };
