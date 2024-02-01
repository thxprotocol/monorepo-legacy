import {
    TAccount,
    TQuestEntry,
    TPointReward,
    AccessTokenKind,
    TDiscordMessage,
    TValidationResult,
} from '@thxnetwork/common/lib/types';
import { WalletDocument } from '../models/Wallet';
import { PointRewardClaim } from '../models/PointRewardClaim';
import DiscordMessage from '../models/DiscordMessage';

import { PointReward } from '../models/PointReward';
import { IQuestService } from './interfaces/IQuestService';
import { getPlatformUserId, requirementMap } from './maps/quests';

type TRestartDates = { now: Date; start: Date; endDay: Date; end: Date };

export default class QuestDiscordService implements IQuestService {
    models = {
        quest: PointReward,
        entry: PointRewardClaim,
    };

    async decorate({
        quest,
        account,
        wallet,
    }: {
        quest: TPointReward;
        account: TAccount;
        wallet?: WalletDocument;
    }): Promise<
        TPointReward & {
            messages: TDiscordMessage[];
            restartDates: TRestartDates;
            amount: number;
            isAvailable: boolean;
        }
    > {
        const restartDates = this.getRestartDates(quest);
        const amount = await this.getAmount({ quest, account, wallet });
        const messages = await this.getMessages({ account, quest, start: restartDates.start });
        const isAvailable = await this.isAvailable({ quest, wallet, account });
        const extraParams = await this.getDiscordMessagePoints({
            quest,
            account,
            start: restartDates.start,
            end: restartDates.end,
        });

        return {
            ...quest,
            restartDates,
            isAvailable,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
            amount,
            messages,
            ...extraParams,
        };
    }

    private async getMessages({ quest, account, start }: { quest: TPointReward; account: TAccount; start: Date }) {
        if (!account) return [];

        const userId = getPlatformUserId(account, quest.platform);
        return await DiscordMessage.find({
            guildId: quest.content,
            memberId: userId,
            createdAt: { $gte: new Date(start).toISOString() },
        });
    }

    // Specific to Discord Message quest
    async isAvailable(options: { quest: TPointReward; wallet: WalletDocument; account: TAccount }): Promise<boolean> {
        return true;
    }

    async getAmount({
        account,
        quest,
    }: {
        quest: TPointReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<number> {
        const { start, end } = this.getRestartDates(quest);
        const { pointsAvailable } = await this.getDiscordMessagePoints({ quest, account, start, end });
        return pointsAvailable;
    }

    async getValidationResult(options: {
        quest: TPointReward;
        account: TAccount;
        wallet: WalletDocument;
        data: Partial<TQuestEntry>;
    }): Promise<TValidationResult> {
        if (!options.quest.interaction) return { result: false, reason: '' };
        return await requirementMap[options.quest.interaction](options.account, options.quest);
    }

    private getRestartDates(quest: TPointReward) {
        const { days } = JSON.parse(quest.contentMetadata);
        const now = new Date();
        const questCreatedAt = new Date(quest.createdAt);
        const totalDaysRunning = Math.floor(
            Math.ceil(now.getTime() / 1000 - questCreatedAt.getTime() / 1000) / 60 / 60 / 24,
        );
        const daysRunning = totalDaysRunning % days;
        const msRunning = daysRunning * 24 * 60 * 60 * 1000;

        const start = new Date(now.getTime() - msRunning);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
        const endDay = new Date(now);
        endDay.setUTCHours(23, 59, 59, 999);

        return { now, start, endDay, end };
    }

    async getDiscordMessagePoints({ quest, start, end, account }) {
        if (!account) return { pointsAvailable: 0, pointsClaimed: 0 };

        const platformUserId = getPlatformUserId(account, quest.platform);
        const claims = await PointRewardClaim.find({
            questId: String(quest._id),
            platformUserId,
            createdAt: {
                $gte: start,
                $lt: end,
            },
        }).sort({ createdAt: -1 });
        const [claim] = claims;
        const pointsClaimed = claims.reduce((total, claim) => total + Number(claim.amount), 0);

        // Only find messages created after the last claim if one exists
        const messages = await DiscordMessage.find({
            guildId: quest.content,
            memberId: platformUserId,
            createdAt: { $gte: claim ? claim.createdAt : start, $lt: end },
        });
        const pointsAvailable = messages.length * quest.amount;

        return { pointsClaimed, pointsAvailable };
    }
}
