import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TQuestLock } from '@thxnetwork/common/lib/types';
import { questMap } from './QuestService';

async function getIsUnlocked(lock: TQuestLock, wallet: WalletDocument): Promise<boolean> {
    const ModelQuestEntry = questMap[lock.variant].models.entry;
    return !!(await ModelQuestEntry.exists({ questId: lock.questId, walletId: String(wallet._id) }));
}

async function getIsLocked(locks: TQuestLock[], wallet: WalletDocument) {
    if (!locks.length) return false;
    const promises = locks.map((lock) => getIsUnlocked(lock, wallet));
    const results = await Promise.allSettled(promises);
    const anyRejected = results.some((result) => result.status === 'rejected');
    if (anyRejected) return true;

    return results
        .filter((result) => result.status === 'fulfilled')
        .map((result: any & { value: boolean }) => result.value)
        .includes(false);
}

async function removeAllLocks(questId: string) {
    for (const variant in questMap) {
        const { models } = questMap[variant];
        const lockedQuests = await models.quest.find({ 'locks.questId': questId });
        for (const lockedQuest of lockedQuests) {
            const index = lockedQuest.locks.findIndex((lock: TQuestLock) => lock.questId === questId);
            const locks = lockedQuest.locks.splice(index, 1);

            await lockedQuest.updateOne({ locks });
        }
    }
}

export default { getIsLocked, removeAllLocks };
