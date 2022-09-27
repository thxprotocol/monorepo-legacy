import { TransactionState, TransactionType } from '@thxnetwork/api/types/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { logger } from '@thxnetwork/api/util/logger';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { parseLogs } from '@thxnetwork/api/util/events';
import { handleEvents } from '@thxnetwork/api/util/jobs';

export async function jobProcessTransactions() {
    const transactions: TransactionDocument[] = await Transaction.find({
        $or: [{ state: TransactionState.Queued }, { state: TransactionState.Sent }],
        type: TransactionType.Relayed,
    }).sort({ createdAt: 'asc' });

    for (const tx of transactions) {
        try {
            const receipt = await TransactionService.send(tx.to, tx.call.fn, JSON.parse(tx.call.args));

            if (receipt.transactionHash) {
                await tx.updateOne({
                    gas: receipt.gasUsed,
                    transactionHash: receipt.transactionHash,
                    state: TransactionState.Mined,
                });

                if (await AssetPoolService.findByAddress(tx.to)) {
                    await AssetPool.updateOne(
                        { address: tx.to, chainId: tx.chainId },
                        { lastTransactionAt: Date.now() },
                    );
                }

                await handleEvents(tx, parseLogs(receipt.logs));
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
