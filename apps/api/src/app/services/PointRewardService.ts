import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointRewardDocument, PointReward as PointRewardSchema } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { Wallet, WalletDocument } from '@thxnetwork/api/models/Wallet';
import { PointBalance } from './PointBalanceService';
import { TPointReward, TAccount, TDiscordMessage } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform, RewardConditionInteraction, AccessTokenKind } from '@thxnetwork/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import DiscordMessage from '../models/DiscordMessage';

const getPlatformUserId = async (reward: TPointReward, account: TAccount) => {
    try {
        switch (reward.platform) {
            case RewardConditionPlatform.Google:
                return await YouTubeDataProxy.getUserId(account);
            case RewardConditionPlatform.Twitter:
                return await TwitterDataProxy.getUserId(account);
            case RewardConditionPlatform.Discord: {
                return await DiscordDataProxy.getUserId(account);
            }
        }
    } catch (error) {
        return 'Could not get the platform user ID for this claim.';
    }
};

function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
}

async function findEntries(quest: PointRewardDocument) {
    const entries = await PointRewardClaim.find({ pointRewardId: quest._id });
    const subs = entries.map((entry) => entry.sub);
    const accounts = await AccountProxy.getMany(subs);

    return await Promise.all(
        entries.map(async (entry) => {
            const wallet = await Wallet.findById(entry.walletId);
            const account = accounts.find((a) => a.sub === wallet.sub);
            const pointBalance = await PointBalance.findOne({
                poolId: quest.poolId,
                walletId: wallet._id,
            });
            return { ...entry.toJSON(), account, wallet, pointBalance: pointBalance ? pointBalance.balance : 0 };
        }),
    );
}

async function isCompleted(quest: PointRewardDocument, account: TAccount, wallet?: WalletDocument) {
    if (!account || !wallet) return false;

    // We validate for both here since there are claims that only contain a sub and should not be claimed again
    const ids = [{ sub: account.sub }, { walletId: wallet._id }];
    const platformUserId = await getPlatformUserId(quest, account);
    if (platformUserId) ids['platformUserId'] = platformUserId;

    const isCompletedAlready = await PointRewardClaim.exists({
        pointRewardId: quest._id,
        $or: ids,
    });

    if (quest.interaction === RewardConditionInteraction.DiscordMessage) {
        return false;
    }

    return isCompletedAlready;
}

export async function isValid(reward: TPointReward, account: TAccount): Promise<string> {
    if (reward.platform === RewardConditionPlatform.None) return;

    try {
        switch (reward.interaction) {
            case RewardConditionInteraction.YouTubeLike: {
                const result = await YouTubeDataProxy.validateLike(account, reward.content);
                if (!result) return 'Youtube: Video has not been liked.';
                break;
            }
            case RewardConditionInteraction.YouTubeSubscribe: {
                const result = await YouTubeDataProxy.validateSubscribe(account, reward.content);
                if (!result) return 'Youtube: Not subscribed to channel.';
                break;
            }
            case RewardConditionInteraction.TwitterLike: {
                const result = await TwitterDataProxy.validateLike(account, reward.content);
                if (!result) return 'X: Post has not been liked.';
                break;
            }
            case RewardConditionInteraction.TwitterRetweet: {
                const result = await TwitterDataProxy.validateRetweet(account, reward.content);
                if (!result) return 'X: Post is not reposted.';
                break;
            }
            case RewardConditionInteraction.TwitterLikeRetweet: {
                const resultLike = await TwitterDataProxy.validateLike(account, reward.content);
                const resultRetweet = await TwitterDataProxy.validateRetweet(account, reward.content);
                if (!resultLike) return 'X: Post has not been liked.';
                if (!resultRetweet) return 'X: Post is not reposted.';
                break;
            }
            case RewardConditionInteraction.TwitterFollow: {
                const result = await TwitterDataProxy.validateFollow(account, reward.content);
                if (!result) return 'X: Account is not followed.';
                break;
            }
            case RewardConditionInteraction.TwitterMessage: {
                const result = await TwitterDataProxy.validateMessage(account, reward.content);
                if (!result) return `X: Your last post does not contain exactly "${reward.content}".`;
                break;
            }
            case RewardConditionInteraction.DiscordGuildJoined: {
                const result = await DiscordDataProxy.validateGuildJoined(account, reward.content);
                if (!result) {
                    const userId = await getPlatformUserId(reward, account);
                    return `Discord: User #${userId} has not joined Discord server #${reward.content}.`;
                }
                break;
            }
        }
    } catch (error) {
        return 'We were unable to confirm the requirements for this quest.';
    }
}

async function getPointsAvailable(quest: TPointReward, account: TAccount) {
    if (!account || quest.interaction !== RewardConditionInteraction.DiscordMessage)
        return { pointsAvailable: quest.amount };

    const connectedAccount = account.connectedAccounts.find(({ kind }) => kind === AccessTokenKind.Discord);
    if (!connectedAccount) return { pointsAvailable: 0, pointsClaimed: 0 };

    const { days, limit } = JSON.parse(quest.contentMetadata);
    const { start, end } = getRestartDates(quest);
    const claims = await PointRewardClaim.find({
        pointRewardId: String(quest._id),
        platformUserId: connectedAccount.userId,
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
        memberId: connectedAccount.userId,
        createdAt: { $gte: claim ? claim.createdAt : start, $lt: end },
    });

    const pointsAvailable = messages.length * quest.amount;

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

export const PointReward = PointRewardSchema;

export default {
    getPointsAvailable,
    findByPool,
    findEntries,
    isCompleted,
    isValid,
    getPlatformUserId,
    getRestartDates,
};
