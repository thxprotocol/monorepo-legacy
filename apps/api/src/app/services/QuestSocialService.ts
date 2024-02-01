import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from './PointBalanceService';
import { TPointReward, TAccount, TQuestEntry, TValidationResult } from '@thxnetwork/types/interfaces';
import { IQuestService } from './interfaces/IQuestService';
import { getPlatformUserId, requirementMap } from './maps/quests';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export default class QuestSocialService implements IQuestService {
    models = {
        quest: PointReward,
        entry: PointRewardClaim,
    };

    async decorate({
        quest,
        wallet,
        account,
    }: {
        quest: TPointReward;
        account?: TAccount;
        wallet?: WalletDocument;
    }): Promise<TPointReward & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, wallet, account });

        return {
            ...quest,
            isAvailable,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
        };
    }

    async isAvailable({
        quest,
        wallet,
        account,
    }: {
        quest: TPointReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<boolean> {
        if (!wallet || !account) return true;

        // We validate for both here since there are entries that only contain a sub
        // and should not be claimed again.
        const ids: any[] = [{ sub: wallet.sub }, { walletId: wallet._id }];
        const platformUserId = await getPlatformUserId(account, quest.platform);
        if (platformUserId) ids.push({ platformUserId });

        // If no entry exist the quest is available
        return !(await PointRewardClaim.exists({
            questId: quest._id,
            $or: ids,
        }));
    }

    async getAmount({ quest }: { quest: TPointReward; wallet: WalletDocument; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        account,
        wallet,
    }: {
        quest: TPointReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult> {
        // Check if completed already
        const available = await this.isAvailable({ quest, account, wallet });
        if (!available) return { result: false, reason: 'You have completed this quest already.' };

        // Check quest requirements
        try {
            const validationResult = await requirementMap[quest.interaction](account, quest);
            return validationResult || { result: true, reason: '' };
        } catch (error) {
            return { result: false, reason: 'We were unable to confirm the requirements for this quest.' };
        }
    }

    static async findEntries(quest: PointRewardDocument, page = 1, limit = 25) {
        const skip = (page - 1) * limit;
        const total = await PointRewardClaim.countDocuments({ questId: quest._id });
        const entries = await PointRewardClaim.find({ questId: quest._id }).limit(limit).skip(skip);
        const subs = entries.map((entry) => entry.sub);
        const accounts = await AccountProxy.getMany(subs);
        const pointBalances = await PointBalance.find({
            poolId: quest.poolId,
        });
        const promises = entries.map(async (entry) => {
            const wallet = await Wallet.findById(entry.walletId);
            const account = accounts.find((a) => a.sub === wallet.sub);
            const pointBalance = pointBalances.find((w) => w.walletId === String(wallet._id));

            return { ...entry.toJSON(), account, wallet, pointBalance: pointBalance ? pointBalance.balance : 0 };
        });
        const results = await Promise.allSettled(promises);
        return {
            total,
            limit,
            page,
            results: results.filter((result) => result.status === 'fulfilled').map((result: any) => result.value),
        };
    }
}
