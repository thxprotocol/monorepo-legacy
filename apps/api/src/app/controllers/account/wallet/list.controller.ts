import { Request, Response } from 'express';
import { query } from 'express-validator';
import { TransactionState } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    const wallet = await SafeService.findPrimary(
        req.auth.sub,
        req.query.chainId ? Number(req.query.chainId) : getChainId(),
    );
    const wallets = [];
    if (wallet) wallets.push(wallet);

    const result = await Promise.all(
        wallets.map(async (wallet: WalletDocument) => {
            const pendingTransactions = await Transaction.find({
                walletId: String(wallet._id),
                state: TransactionState.Confirmed,
            });
            return {
                ...wallet.toJSON(),
                pendingTransactions,
            };
        }),
    );

    res.json(result);
};

export default { controller, validation };
