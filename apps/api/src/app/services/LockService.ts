import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TQuestLock } from '@thxnetwork/common/lib/types';
import { questMap } from './QuestService';

async function getIsUnlocked(lock: TQuestLock, wallet: WalletDocument): Promise<boolean> {
    const ModelQuestEntry = questMap[lock.variant].models.entry;
    return !!(await ModelQuestEntry.exists({ questId: lock.questId, walletId: String(wallet._id) }));
}

async function getIsLocked(locks: TQuestLock[], wallet: WalletDocument) {
    const promises = locks.map((lock) => getIsUnlocked(lock, wallet));
    const results = await Promise.allSettled(promises);
    const anyRejected = results.some((result) => result.status === 'rejected');
    if (anyRejected) return true;

    return results
        .filter((result) => result.status === 'fulfilled')
        .map((result: any & { value: boolean }) => result.value)
        .includes(false);
}

export default { getIsLocked };
