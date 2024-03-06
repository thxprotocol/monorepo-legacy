import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { BigNumber } from 'ethers';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';
import TransactionService from '@thxnetwork/api/services/TransactionService';

export const validation = [body('spender').isEthereumAddress(), body('amountInWei').isString()];

export const controller = async (req: Request, res: Response) => {
    const chainId = getChainId();
    const wallet = await SafeService.findOne({ sub: req.auth.sub, chainId });
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(chainId);

    // Check sufficient BPT Balance
    const bpt = new web3.eth.Contract(contractArtifacts['BPTToken'].abi, contractNetworks[chainId].BPT);
    const amount = await bpt.methods.balanceOf(wallet.address).call();
    if (BigNumber.from(amount).lt(req.body.amountInWei)) throw new ForbiddenError('Insufficient balance');

    const fn = bpt.methods.approve(req.body.spender, req.body.amountInWei);

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, bpt.options.address, fn);

    res.status(201).json([tx]);
};
export default { controller, validation };
