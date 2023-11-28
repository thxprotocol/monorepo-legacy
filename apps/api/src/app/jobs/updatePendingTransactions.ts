import { TransactionState, TransactionType } from '@thxnetwork/types/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { Wallet } from '../models/Wallet';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import SafeService from '../services/SafeService';
import { logger } from '../util/logger';

export async function updatePendingTransactions() {
    const transactions: TransactionDocument[] = await Transaction.find({
        $or: [{ state: TransactionState.Confirmed }, { state: TransactionState.Sent }],
    }).sort({ createdAt: 'asc' });

    // Iterate over all tx sent to or proposed and confirmed by the relayer
    for (const tx of transactions) {
        switch (tx.state) {
            // Legacy tx will not have this state
            // Transactions is proposed and confirmed by the relayer, awaiting user wallet confirmation
            case TransactionState.Confirmed: {
                if (!tx.walletId) continue;
                console.log(tx);

                const wallet = await Wallet.findById(tx.walletId);

                let pendingTx;
                try {
                    pendingTx = await SafeService.getTransaction(wallet, tx.safeTxHash);
                    logger.debug(`Safe TX Found: ${tx.safeTxHash}`);
                } catch (error) {
                    logger.error(error);
                }

                // Check if tx is confirmed by 2 owners
                const threshold = 2;
                if (pendingTx && pendingTx.confirmations.length >= threshold) {
                    logger.debug(`Safe TX Confirmed: ${tx.safeTxHash}`);

                    try {
                        await SafeService.executeTransaction(wallet, tx.safeTxHash);
                        logger.debug(`Safe TX Executed: ${tx.safeTxHash}`);
                    } catch (error) {
                        await tx.updateOne({ state: TransactionState.Failed });
                        logger.error(error);
                    }
                }
                break;
            }
            // TransactionType.Default is handled in tx service send methods
            case TransactionState.Sent: {
                if (tx.type == TransactionType.Relayed) {
                    TransactionService.queryTransactionStatusDefender(tx).catch((error) => logger.error(error));
                }
                break;
            }
        }
    }
}
