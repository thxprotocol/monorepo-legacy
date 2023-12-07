import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ChainId, TransactionState } from '@thxnetwork/types/enums';
import { Transaction } from '@thxnetwork/api/models/Transaction';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Account Wallet']
    const wallet = await SafeService.findPrimary(
        req.auth.sub,
        req.query.chainId ? Number(req.query.chainId) : ChainId.Polygon,
    );
    const pendingTransactions = await Transaction.find({
        walletId: String(wallet._id),
        state: TransactionState.Confirmed,
    });

    res.json([
        {
            ...wallet.toJSON(),
            pendingTransactions,
        },
    ]);
};

export default { controller, validation };
