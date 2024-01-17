import { Request, Response } from 'express';
import { body } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { contractArtifacts } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import SafeService from '@thxnetwork/api/services/SafeService';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { BigNumber } from 'ethers';
import { BPT_ADDRESS } from '@thxnetwork/api/config/secrets';

export const validation = [body('veAddress').isEthereumAddress(), body('amountInWei').isString()];

export const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(req.auth.sub, ChainId.Hardhat);
    if (!wallet) throw new NotFoundError('Could not find wallet for account');

    const { web3 } = getProvider(ChainId.Hardhat);

    // Check sufficient BPT Balance
    const bpt = new web3.eth.Contract(contractArtifacts['BPTToken'].abi, BPT_ADDRESS);
    const amount = await bpt.methods.balanceOf(wallet.address).call();
    if (BigNumber.from(amount).lt(req.body.amountInWei)) throw new ForbiddenError('Insufficient balance');

    const fn = bpt.methods.approve(req.body.veAddress, req.body.amountInWei);

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, bpt.options.address, fn);

    res.status(201).json(tx);
};
export default { controller, validation };
