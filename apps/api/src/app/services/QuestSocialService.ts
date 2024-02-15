import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { TPointReward, TAccount, TQuestEntry, TValidationResult } from '@thxnetwork/types/interfaces';
import { IQuestService } from './interfaces/IQuestService';
import { requirementMap } from './maps/quests';
import { logger } from '../util/logger';
import QuestService from './QuestService';
import { QuestVariant } from '@thxnetwork/common/lib/types';

export default class QuestSocialService implements IQuestService {
    models = {
        quest: PointReward,
        entry: PointRewardClaim,
    };

    async decorate({
        quest,
        wallet,
        account,
        data,
    }: {
        quest: TPointReward;
        account?: TAccount;
        wallet?: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TPointReward & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, wallet, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
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
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult> {
        if (!wallet || !account) return { result: true, reason: '' };

        // We validate for both here since there are entries that only contain a sub
        // and should not be claimed again.
        const ids: any[] = [{ sub: account.sub }, { walletId: String(wallet._id) }];
        const platformUserId = QuestService.findUserIdForInteraction(account, quest.interaction);
        if (platformUserId) ids.push({ platformUserId });

        // If no entry exist the quest is available
        const isCompleted = await PointRewardClaim.exists({
            questId: quest._id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this (connected) account already.' };
    }

    async getAmount({ quest }: { quest: TPointReward; wallet: WalletDocument; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        account,
    }: {
        quest: TPointReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult> {
        try {
            // Check quest requirements
            const validationResult = await requirementMap[quest.interaction](account, quest);
            return validationResult || { result: true, reason: '' };
        } catch (error) {
            logger.error(error);
            return { result: false, reason: 'We were unable to confirm the requirements for this quest.' };
        }
    }

    async findEntryMetadata({ quest }: { quest: PointRewardDocument }) {
        const reachTotal = await this.getTwitterFollowerCount(quest);
        const uniqueParticipantIds = await PointRewardClaim.find({
            questId: String(quest._id),
        }).distinct('sub');

        return { reachTotal, participantCount: uniqueParticipantIds.length };
    }

    async getTwitterFollowerCount(quest: PointRewardDocument) {
        if (quest.variant !== QuestVariant.Twitter) return;

        const [result] = await PointRewardClaim.aggregate([
            { $match: { questId: String(quest._id) } },
            { $group: { _id: null, totalFollowersCount: { $sum: '$publicMetrics.followersCount' } } },
        ]);

        return result ? result.totalFollowersCount : 0;
    }
}
