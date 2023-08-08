import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TransactionState } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const query = { sub: req.auth.sub };
    if (req.query.chainId) query['chainId'] = Number(req.query.chainId);

    const wallets = await Wallet.find(query);

    res.json(
        await Promise.all(
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
        ),
    );
};

export default { controller, validation };
