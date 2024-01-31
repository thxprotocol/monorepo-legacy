import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointReward, PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from './PointBalanceService';
import { TPointReward, TAccount, TQuest, TQuestEntry } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform, RewardConditionInteraction, AccessTokenKind } from '@thxnetwork/types/enums';
import { logger } from '../util/logger';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import { IQuestService, TValidationResult } from './QuestService';

const questConditionMap: {
    [interaction: number]: (account: TAccount, quest) => Promise<void | { result: boolean; reason: string }>;
} = {
    [RewardConditionInteraction.YouTubeLike]: async (account, quest) => {
        const result = await YouTubeDataProxy.validateLike(account, quest.content);
        if (!result) return { result: false, reason: 'Youtube: Video has not been liked.' };
    },
    [RewardConditionInteraction.YouTubeSubscribe]: async (account, quest) => {
        const result = await YouTubeDataProxy.validateSubscribe(account, quest.content);
        if (!result) return { result: false, reason: 'Youtube: Not subscribed to channel.' };
    },
    [RewardConditionInteraction.TwitterLike]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
    },
    [RewardConditionInteraction.TwitterRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [RewardConditionInteraction.TwitterLikeRetweet]: async (account, quest) => {
        const validationResultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!validationResultUser.result) return validationResultUser;
        const validationResultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!validationResultLike.result) return validationResultLike;
        const validationResultRepost = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!validationResultRepost.result) return validationResultRepost;
    },
    [RewardConditionInteraction.TwitterFollow]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser.result) return resultUser;
        const validationResultFollow = await TwitterDataProxy.validateFollow(account, quest.content);
        if (!validationResultFollow.result) return validationResultFollow;
    },
    [RewardConditionInteraction.TwitterMessage]: async (account, quest) => {
        const validationResultMessage = await TwitterDataProxy.validateMessage(account, quest.content);
        if (!validationResultMessage.result) return validationResultMessage;
    },
};

const platformInteractionMap = {
    [RewardConditionInteraction.YouTubeLike]: RewardConditionPlatform.Google,
    [RewardConditionInteraction.YouTubeSubscribe]: RewardConditionPlatform.Google,
    [RewardConditionInteraction.TwitterLike]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterRetweet]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterFollow]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.DiscordGuildJoined]: RewardConditionPlatform.Discord,
    [RewardConditionInteraction.TwitterMessage]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.TwitterLikeRetweet]: RewardConditionPlatform.Twitter,
    [RewardConditionInteraction.DiscordMessage]: RewardConditionPlatform.Discord,
    [RewardConditionInteraction.DiscordMessageReaction]: RewardConditionPlatform.Discord,
};

export const getPlatformUserId = async (account: TAccount, platform: RewardConditionPlatform) => {
    if (!platform) return;

    const getUserId = (account: TAccount, kind: AccessTokenKind) => {
        const token = account.connectedAccounts.find((a) => a.kind === kind);
        return token && token.userId;
    };

    const map = {
        [RewardConditionPlatform.Google]: getUserId(account, AccessTokenKind.YoutubeManage),
        [RewardConditionPlatform.Twitter]: getUserId(account, AccessTokenKind.Twitter),
        [RewardConditionPlatform.Discord]: getUserId(account, AccessTokenKind.Discord),
    };

    return map[platform];
};

export default class QuestSocialService implements IQuestService {
    models = {
        quest: PointReward,
        entry: PointRewardClaim,
    };

    list(options: { pool: AssetPoolDocument }): Promise<TQuest[]> {
        throw new Error('Method not implemented.');
    }

    async decorate({
        quest,
    }: {
        quest: TPointReward;
        wallet?: WalletDocument;
    }): Promise<TPointReward & { pointsAvailable }> {
        return {
            ...quest,
            pointsAvailable: quest.amount,
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
        if (!account || !wallet) return true;

        // We validate for both here since there are entries that only contain a sub
        // and should not be claimed again.
        const ids: any[] = [{ sub: account.sub }, { walletId: wallet._id }];
        const platformUserId = await getPlatformUserId(account, quest.platform);
        if (platformUserId) ids.push({ platformUserId });

        // If no entry exist the quest is available
        return !(await PointRewardClaim.exists({
            questId: quest._id,
            $or: ids,
        }));
    }

    async getAmount({
        quest,
    }: {
        quest: TPointReward;
        wallet: WalletDocument;
        account: TAccount;
    }): Promise<{ pointsAvailable: number; pointsClaimed?: number }> {
        return { pointsAvailable: quest.amount };
    }

    findById(id: string): Promise<TPointReward> {
        throw new Error('Method not implemented.');
    }

    updateById(id: string, options: Partial<TPointReward>): Promise<TPointReward> {
        throw new Error('Method not implemented.');
    }

    create(options: Partial<TPointReward>): Promise<TPointReward> {
        const { interaction } = options;
        const platform = interaction && platformInteractionMap[interaction];

        throw new Error('Method not implemented.');
    }

    createEntry(options: Partial<TQuestEntry>): Promise<TQuestEntry> {
        throw new Error('Method not implemented.');
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
            const validationResult = await questConditionMap[quest.interaction](account, quest);
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
