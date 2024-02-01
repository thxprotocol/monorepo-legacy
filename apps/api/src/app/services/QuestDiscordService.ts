import {
    TQuest,
    TAccount,
    TQuestEntry,
    TPointReward,
    AccessTokenKind,
    RewardConditionInteraction,
    TPointRewardClaim,
    TDiscordMessage,
    TValidationResult,
} from '@thxnetwork/common/lib/types';
import { AssetPoolDocument } from '../models/AssetPool';
import { WalletDocument } from '../models/Wallet';
import { PointRewardClaim } from '../models/PointRewardClaim';
import { getPlatformUserId } from './QuestSocialService';
import DiscordMessage from '../models/DiscordMessage';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import { PointReward } from '../models/PointReward';
import { IQuestService } from './interfaces/IQuestService';

const requirementMap: {
    [interaction: number]: (account: TAccount, quest: TPointReward) => Promise<TValidationResult>;
} = {
    [RewardConditionInteraction.DiscordGuildJoined]: async (account, quest) => {
        const validationResultMember = await DiscordDataProxy.validateGuildJoined(account, quest.content);
        if (!validationResultMember.result) return validationResultMember;
    },
    [RewardConditionInteraction.DiscordMessage]: async (account, quest) => {
        return { result: true, reason: '' };
    },
    [RewardConditionInteraction.DiscordMessageReaction]: async (account, quest) => {
        return { result: true, reason: '' };
    },
};

export default class QuestDiscordService implements IQuestService {
    models = {
        quest: PointReward,
        entry: PointRewardClaim,
    };

    list(options: { pool: AssetPoolDocument }): Promise<TQuest[]> {
        throw new Error('Method not implemented.');
    }

    async decorate({
        quest,
        account,
        wallet,
    }: {
        quest: TPointReward;
        account: TAccount;
        wallet?: WalletDocument;
    }): Promise<TPointReward & { now: Date; start: Date; endDay: Date; end: Date }> {
        const restartDates = this.getRestartDates(quest);
        const discordMessageData = await this.getAmount({ quest, account, wallet });

        return {
            ...quest,
            pointsAvailable: quest.amount,
            contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
            ...restartDates,
            ...discordMessageData,
        };
    }

    // Specific to Discord Message quest
    async isAvailable(options: { quest: TPointReward; wallet: WalletDocument; account: TAccount }): Promise<boolean> {
        const platformUserId = await getPlatformUserId(options.account, options.quest.platform);
        const { start, end } = this.getRestartDates(options.quest);
        const { pointsAvailable } = await this.getDiscordMessagePoints(options.quest, platformUserId, start, end);

        return pointsAvailable > 0;
    }

    async getAmount({
        account,
        quest,
    }: {
        quest: TPointReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<{ pointsAvailable: number; pointsClaimed?: number; amount?: number; messages?: TDiscordMessage[] }> {
        // Specific to Discord Message quest
        const connectedAccount = account.connectedAccounts.find(({ kind }) => kind === AccessTokenKind.Discord);
        if (!connectedAccount) return { pointsAvailable: 0, pointsClaimed: 0 };

        const { days, limit } = JSON.parse(quest.contentMetadata);
        const { start, end } = this.getRestartDates(quest);
        const { pointsClaimed, pointsAvailable } = await this.getDiscordMessagePoints(
            quest,
            connectedAccount.userId,
            start,
            end,
        );

        return {
            messages: await DiscordMessage.find({
                guildId: quest.content,
                memberId: connectedAccount.userId,
                createdAt: { $gte: new Date(start).toISOString() },
            }),
            amount: days * limit * quest.amount,
            pointsClaimed,
            pointsAvailable,
        };
    }
    async findById(id: string): Promise<TPointReward> {
        return await PointReward.findById(id);
    }
    async updateById(id: string, options: Partial<TPointReward>): Promise<TPointReward> {
        return await PointReward.findByIdAndUpdate(id, options, { new: true });
    }
    async create(options: Partial<TPointReward>): Promise<TPointReward> {
        return await PointReward.create(options);
    }
    createEntry(options: Partial<TPointRewardClaim>): Promise<TPointRewardClaim> {
        throw new Error('Method not implemented.');
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

    async getDiscordMessagePoints(quest: TPointReward, platformUserId: string, start: Date, end: Date) {
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

        console.log(pointsAvailable, pointsClaimed, messages.length, platformUserId);

        return { pointsClaimed, pointsAvailable };
    }
}
