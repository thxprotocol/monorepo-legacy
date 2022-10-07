import { TransactionState, TransactionType } from '@thxnetwork/api/types/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { logger } from '@thxnetwork/api/util/logger';
import TransactionService from '@thxnetwork/api/services/TransactionService';

export async function updatePendingTransactions() {
    const transactions: TransactionDocument[] = await Transaction.find({
        state: TransactionState.Sent,
        type: TransactionType.Relayed,
    }).sort({ createdAt: 'asc' });

    for (const tx of transactions) {
        TransactionService.queryTransactionStatusDefender(tx).catch((error) => logger.error(error));
    }
}
