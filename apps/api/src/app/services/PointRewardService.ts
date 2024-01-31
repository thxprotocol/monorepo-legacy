import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointRewardDocument, PointReward } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from './PointBalanceService';
import { TPointReward, TAccount } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform, RewardConditionInteraction, AccessTokenKind } from '@thxnetwork/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import DiscordMessage from '../models/DiscordMessage';
import { logger } from '../util/logger';

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
    [RewardConditionInteraction.DiscordGuildJoined]: async (account, quest) => {
        const validationResultMember = await DiscordDataProxy.validateGuildJoined(account, quest.content);
        if (!validationResultMember.result) return validationResultMember;
    },
    [RewardConditionInteraction.DiscordMessage]: async (account, quest) => {
        return;
    },
    [RewardConditionInteraction.DiscordMessageReaction]: async (account, quest) => {
        return;
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

const getPlatformUserId = async (quest: TPointReward, account: TAccount) => {
    if (!quest.platform) return;

    try {
        const getUserId = (account: TAccount, kind: AccessTokenKind) => {
            const token = account.connectedAccounts.find((a) => a.kind === kind);
            return token && token.userId;
        };
        switch (quest.platform) {
            case RewardConditionPlatform.Google:
                return getUserId(account, AccessTokenKind.YoutubeManage);
            case RewardConditionPlatform.Twitter:
                return getUserId(account, AccessTokenKind.Twitter);
            case RewardConditionPlatform.Discord: {
                return getUserId(account, AccessTokenKind.Discord);
            }
        }
    } catch (error) {
        logger.error('Could not get the platform user ID for this claim.');
    }
};

function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
}

async function findEntries(quest: PointRewardDocument, page = 1, limit = 25) {
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

async function isAvailable(quest: PointRewardDocument, account: TAccount, wallet?: WalletDocument) {
    if (!account || !wallet) return true;

    // We validate for both here since there are entries that only contain a sub
    // and should not be claimed again.
    const ids: any[] = [{ sub: account.sub }, { walletId: wallet._id }];
    const platformUserId = await getPlatformUserId(quest, account);
    if (platformUserId) ids.push({ platformUserId });

    if (quest.interaction !== RewardConditionInteraction.DiscordMessage) {
        // If no entry exist the quest is available
        return !(await PointRewardClaim.exists({
            questId: quest._id,
            $or: ids,
        }));
    }

    // Specific to Discord Message quest
    const { start, end } = getRestartDates(quest);
    const { pointsAvailable } = await getDiscordMessagePoints(quest, platformUserId, start, end);

    return pointsAvailable > 0;
}

export async function validate(
    quest: PointRewardDocument,
    account: TAccount,
    wallet: WalletDocument,
): Promise<{ result: boolean; reason: string }> {
    // Check if completed already
    const available = await isAvailable(quest, account, wallet);
    if (!available) return { result: false, reason: 'You have completed this quest already.' };

    // Check quest requirements
    try {
        const validationResult = await questConditionMap[quest.interaction](account, quest);
        return validationResult || { result: true, reason: '' };
    } catch (error) {
        return { result: false, reason: 'We were unable to confirm the requirements for this quest.' };
    }
}

async function getDiscordMessagePoints(quest, platformUserId, start, end) {
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

async function getPointsAvailable(quest: TPointReward, account: TAccount) {
    if (!account || quest.interaction !== RewardConditionInteraction.DiscordMessage) {
        return { pointsAvailable: quest.amount };
    }

    // Specific to Discord Message quest
    const connectedAccount = account.connectedAccounts.find(({ kind }) => kind === AccessTokenKind.Discord);
    if (!connectedAccount) return { pointsAvailable: 0, pointsClaimed: 0 };

    const { days, limit } = JSON.parse(quest.contentMetadata);
    const { start, end } = getRestartDates(quest);
    const { pointsClaimed, pointsAvailable } = await getDiscordMessagePoints(
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

function getRestartDates(quest: TPointReward) {
    if (!quest.contentMetadata) return;
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

const getDiscordMessageData = async (quest: PointRewardDocument, wallet: WalletDocument) => {
    if (!wallet || quest.interaction !== RewardConditionInteraction.DiscordMessage) return;
    const account = await AccountProxy.getById(wallet.sub);
    return await getPointsAvailable(quest, account);
};

async function findOne(quest: PointRewardDocument, wallet?: WalletDocument) {
    const restartDates = getRestartDates(quest);
    const discordMessageData = await getDiscordMessageData(quest, wallet);
    return {
        ...quest.toJSON(),
        pointsAvailable: quest.amount,
        contentMetadata: quest.contentMetadata && JSON.parse(quest.contentMetadata),
        restartDates,
        ...discordMessageData,
    };
}

async function getAmount(quest, account, wallet) {
    const { pointsAvailable } = await getPointsAvailable(quest, account);
    return pointsAvailable;
}

function getValidationResult(quest, account, wallet) {
    return validate(quest, account, wallet);
}

export { PointReward, platformInteractionMap };
export default {
    findOne,
    validate,
    getPointsAvailable,
    findByPool,
    findEntries,
    getPlatformUserId,
    getRestartDates,
    getAmount,
    getValidationResult,
    isAvailable,
};
