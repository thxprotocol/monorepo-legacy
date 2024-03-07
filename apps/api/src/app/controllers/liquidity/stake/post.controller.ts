import { contractArtifacts } from '@thxnetwork/api/services/ContractService';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import WalletService from '@thxnetwork/api/services/WalletService';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { getProvider } from '@thxnetwork/api/util/network';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import { BigNumber } from 'ethers';
import { Request, Response } from 'express';
import { body, query } from 'express-validator';

export const validation = [body('amountInWei').isInt(), query('walletId').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    const walletId = req.query.walletId as string;
    const wallet = await WalletService.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const { web3 } = getProvider(wallet.chainId);
    const bpt = new web3.eth.Contract(contractArtifacts['BPT'].abi, contractNetworks[wallet.chainId].BPT);

    // Check if sender has sufficinet BPT
    const balanceInWei = await bpt.methods.balanceOf(wallet.address).call();
    if (BigNumber.from(balanceInWei).lt(req.body.amountInWei)) {
        throw new BadRequestError('Insufficient balance');
    }

    // Deposit the BPT into the gauge
    const bptGauge = new web3.eth.Contract(
        contractArtifacts['BPTGauge'].abi,
        contractNetworks[wallet.chainId].BPTGauge,
    );
    const fn = bptGauge.methods.deposit(String(req.body.amountInWei));

    // Propose tx data to relayer and return safeTxHash to client to sign
    const tx = await TransactionService.sendSafeAsync(wallet, bptGauge.options.address, fn);

    res.status(201).json([tx]);
};
export default { controller, validation };
