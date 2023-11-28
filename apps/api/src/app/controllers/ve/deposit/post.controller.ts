import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { contractArtifacts } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import SafeService from '@thxnetwork/api/services/SafeService';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { BigNumber } from 'ethers';

export const validation = [
    body('veAddress').isEthereumAddress(),
    body('bptAddress').isEthereumAddress(),
    body('amountInWei').isString(),
    body('endTimestamp').isInt(),
];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);

    // Check sufficient BPT approval
    const bpt = new web3.eth.Contract(contractArtifacts['BPTToken'].abi, req.body.bptAddress);
    const amount = await bpt.methods.allowance(wallet.address, req.body.veAddress).call();
    if (BigNumber.from(amount).gte(req.body.amountInWei)) throw new ForbiddenError('Insufficient allowance');

    const ve = new web3.eth.Contract(contractArtifacts['VotingEscrow'].abi, req.body.veAddress);

    // Check for lock and determine ve fn to call
    const lock = await ve.methods.locked(wallet.address).call();
    const fn = BigNumber.from(lock.amount).eq(0)
        ? ve.methods.create_lock(req.body.amountInWei, req.body.endTimestamp)
        : ve.methods.increase_amount(req.body.amountInWei);

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, ve.options.address, fn);

    res.status(201).json(tx);
};
export default { controller, validation };
