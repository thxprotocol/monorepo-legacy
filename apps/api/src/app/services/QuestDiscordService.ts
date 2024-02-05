import {
    TAccount,
    TQuestEntry,
    TPointReward,
    TDiscordMessage,
    TValidationResult,
    QuestSocialRequirement,
} from '@thxnetwork/common/lib/types';
import { WalletDocument } from '../models/Wallet';
import { PointRewardClaim } from '../models/PointRewardClaim';
import { PointReward } from '../models/PointReward';
import { IQuestService } from './interfaces/IQuestService';
import { getPlatformUserId, requirementMap } from './maps/quests';
import DiscordMessage from '../models/DiscordMessage';

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
        const amount = await this.getAmount({ quest, account, wallet });
        const isAvailable = await this.isAvailable({ quest, wallet, account });
        const interactionMap = {
            [QuestSocialRequirement.DiscordMessage]: this.getDiscordMessageParams.bind(this),
            [QuestSocialRequirement.DiscordGuildJoined]: this.getDiscordParams.bind(this),
        };
        const extraParams = await interactionMap[quest.interaction]({ quest, account });

        return {
            ...quest,
            amount,
            isAvailable,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
            ...extraParams,
        };
    }

    async isAvailable(options: { quest: TPointReward; wallet: WalletDocument; account: TAccount }): Promise<boolean> {
        const amount = await this.getAmount(options);
        return amount > 0;
    }

    async getAmount({
        account,
        quest,
    }: {
        quest: TPointReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<number> {
        const interactionMap = {
            [QuestSocialRequirement.DiscordMessage]: this.getMessagePoints.bind(this),
            [QuestSocialRequirement.DiscordGuildJoined]: this.getPoints.bind(this),
        };
        const { pointsAvailable } = await interactionMap[quest.interaction]({ quest, account });

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

    private async getDiscordParams({ quest }: { quest: TPointReward; account: TAccount }) {
        return { pointsAvailable: quest.amount };
    }

    private async getDiscordMessageParams({ quest, account }: { quest: TPointReward; account: TAccount }) {
        const restartDates = this.getRestartDates(quest);
        const messages = await this.getMessages({ account, quest, start: restartDates.start });
        const points = await this.getMessagePoints({
            quest,
            account,
        });

        return {
            restartDates,
            messages,
            ...points,
        };
    }

    private async getMessages({ quest, account, start }: { quest: TPointReward; account: TAccount; start: Date }) {
        if (!account) return [];

        const userId = getPlatformUserId(account, quest.interaction);
        return await DiscordMessage.find({
            guildId: quest.content,
            memberId: userId,
            createdAt: { $gte: new Date(start).toISOString() },
        });
    }

    private async getPoints({ quest }) {
        return { pointsAvailable: quest.amount };
    }

    private async getMessagePoints({ quest, account }) {
        if (!account) return { pointsAvailable: 0, pointsClaimed: 0 };

        const { start, end } = this.getRestartDates(quest);
        const platformUserId = getPlatformUserId(account, quest.interaction);
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
