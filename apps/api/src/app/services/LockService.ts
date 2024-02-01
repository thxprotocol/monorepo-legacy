import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TQuestLock } from '@thxnetwork/common/lib/types';
import { serviceMap } from './interfaces/IQuestService';

async function getIsUnlocked(lock: TQuestLock, wallet: WalletDocument): Promise<boolean> {
    const Quest = serviceMap[lock.variant].models.quest;
    return !!(await Quest.exists({ questId: lock.questId, walletId: wallet._id }));
}

async function getIsLocked(locks: TQuestLock[], wallet: WalletDocument) {
    if (!locks.length) return false;
    // Check if all quests still exist
    // TODO

    // Check if there are entries for the remaining quests
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
    for (const variant in Object.keys(serviceMap)) {
        const Quest = serviceMap[variant].models.quest;
        const lockedQuests = await Quest.find({ 'locks.questId': questId });

        for (const lockedQuest of lockedQuests) {
            const index = lockedQuest.locks.findIndex((lock: TQuestLock) => lock.questId === questId);
            const locks = lockedQuest.locks.splice(index, 1);

            await lockedQuest.updateOne({ locks });
        }
    }
}

export default { getIsLocked, removeAllLocks };
