import { Request, Response } from 'express';
import { query } from 'express-validator';
import { Wallet } from '@thxnetwork/api/services/WalletService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { AccountVariant } from '@thxnetwork/types/interfaces';
import { TransactionState } from '@thxnetwork/types/enums';
import SafeService from '@thxnetwork/api/services/SafeService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Transaction } from '@thxnetwork/api/models/Transaction';

const validation = [query('chainId').optional().isNumeric()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Wallets']
    const query = { sub: req.auth.sub };
    if (req.query.chainId) query['chainId'] = Number(req.query.chainId);

    const wallets = await Wallet.find(query);
    const account = await AccountProxy.getById(req.auth.sub);

    res.json(
        await Promise.all(
            wallets.map(async (wallet: WalletDocument) => {
                const isSafe = account.variant !== AccountVariant.Metamask && wallet.address;
                const owners = isSafe ? await SafeService.getOwners(wallet) : [];
                const pendingTransactions = await Transaction.find({
                    walletId: String(wallet._id),
                    state: TransactionState.Confirmed,
                });

                return {
                    ...wallet.toJSON(),
                    owners,
                    pendingTransactions,
                    latestVersion: currentVersion,
                };
            }),
        ),
    );
};

export default { controller, validation };
