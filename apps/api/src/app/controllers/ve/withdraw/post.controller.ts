import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { VE_ADDRESS } from '@thxnetwork/api/config/secrets';
import SafeService from '@thxnetwork/api/services/SafeService';
import TransactionService from '@thxnetwork/api/services/TransactionService';

export const validation = [];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);

    // Check sufficient BPT approval
    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, VE_ADDRESS);
    const lock = await ve.methods.locked(wallet.address).call();
    const latest = await web3.eth.getBlockNumber();
    const now = (await web3.eth.getBlock(latest)).timestamp;

    // Check if client requests early exit and end date has not past
    const isEarlyWithdraw = Number(lock.end) > Number(now);

    // Check for lock and determine ve function to call
    const fn = isEarlyWithdraw ? ve.methods.withdraw_early() : ve.methods.withdraw();

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);

    res.status(201).json(tx);
};
export default { controller, validation };
