import { TransactionState, TransactionType } from '@thxnetwork/types/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { logger } from '@thxnetwork/api/util/logger';
import { Wallet } from '../models/Wallet';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import SafeService from '../services/SafeService';

export async function updatePendingTransactions() {
    const proposedTx: TransactionDocument[] = await Transaction.find({
        state: TransactionState.Confirmed,
    }).sort({ createdAt: 'asc' });

    // Iterate over all tx proposed and confirmed by the relayer
    // Legacy tx will not have this state
    for (const tx of proposedTx) {
        const wallet = await Wallet.findById(tx.walletId);
        const pendingTx = await SafeService.getTransaction(wallet, tx.transactionHash);
        logger.info(`Safe TX Found: ${tx.transactionHash}`);

        // Check if tx is confirmed by 2 owners
        if (pendingTx.confirmations.length >= pendingTx.confirmationsRequired) {
            try {
                await TransactionService.execSafeAsync(wallet, tx);
            } catch (error) {
                await tx.updateOne({ state: TransactionState.Failed });
                logger.error(error);
            }
        }
    }

    // Iterate over all tx sent to the relayer waiting for execution
    // TransactionType.Default is handled in tx service send methods
    const transactions: TransactionDocument[] = await Transaction.find({
        state: TransactionState.Sent,
        type: TransactionType.Relayed,
    }).sort({ createdAt: 'asc' });

    for (const tx of transactions) {
        // Query for tx status by defender
        TransactionService.queryTransactionStatusDefender(tx).catch((error) => logger.error(error));
    }
}
