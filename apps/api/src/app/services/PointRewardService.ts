import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointRewardDocument, PointReward as PointRewardSchema } from '@thxnetwork/api/models/PointReward';
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
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser) return { result: false, reason: 'X: Your account has insufficient followers.' };
        const result = await TwitterDataProxy.validateLike(account, quest.content);
        if (!result) return { result: false, reason: 'X: Post has not been liked.' };
    },
    [RewardConditionInteraction.TwitterRetweet]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser) return { result: false, reason: 'X: Your account has insufficient followers.' };
        const result = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!result) return { result: false, reason: 'X: Post is not reposted.' };
    },
    [RewardConditionInteraction.TwitterLikeRetweet]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser) return { result: false, reason: 'X: Your account has insufficient followers.' };
        const resultLike = await TwitterDataProxy.validateLike(account, quest.content);
        if (!resultLike) return { result: false, reason: 'X: Post has not been liked.' };
        const resultRetweet = await TwitterDataProxy.validateRetweet(account, quest.content);
        if (!resultRetweet) return { result: false, reason: 'X: Post is not reposted.' };
    },
    [RewardConditionInteraction.TwitterFollow]: async (account, quest) => {
        const resultUser = await TwitterDataProxy.validateUser(account, quest);
        if (!resultUser) return { result: false, reason: 'X: Account has insufficient followers.' };
        const result = await TwitterDataProxy.validateFollow(account, quest.content);
        if (!result) return { result: false, reason: 'X: Account is not followed.' };
    },
    [RewardConditionInteraction.TwitterMessage]: async (account, quest) => {
        const result = await TwitterDataProxy.validateMessage(account, quest.content);
        if (!result) return { result: false, reason: `X: Your last post does not contain exactly "${quest.content}".` };
    },
    [RewardConditionInteraction.DiscordGuildJoined]: async (account, quest) => {
        const result = await DiscordDataProxy.validateGuildJoined(account, quest.content);
        if (!result) {
            const userId = await getPlatformUserId(quest, account);
            return {
                result: false,
                reason: `Discord: User #${userId} has not joined Discord server #${quest.content}.`,
            };
        }
    },
};

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
        logger.error('Could not get the platform user ID for this claim.');
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
    const ids: any[] = [{ sub: account.sub }, { walletId: wallet._id }];
    const platformUserId = await getPlatformUserId(quest, account);
    if (platformUserId) ids.push({ platformUserId });

    const isCompletedAlready = await PointRewardClaim.exists({
        pointRewardId: quest._id,
        $or: ids,
    });

    if (quest.interaction === RewardConditionInteraction.DiscordMessage) {
        return false;
    }

    return isCompletedAlready;
}

export async function validate(
    quest: PointRewardDocument,
    account: TAccount,
    wallet: WalletDocument,
): Promise<{ result: boolean; reason: string }> {
    // Check if completed already
    const isCompletedAlready = await isCompleted(quest, account, wallet);
    if (isCompletedAlready) return { result: false, reason: 'You have completed this quest already.' };

    // Check quest requirements
    try {
        const validationResult = await questConditionMap[quest.variant](account, quest);
        return validationResult || { result: true, reason: '' };
    } catch (error) {
        return { result: false, reason: 'We were unable to confirm the requirements for this quest.' };
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

export const PointReward = PointRewardSchema;

export default {
    validate,
    getPointsAvailable,
    findByPool,
    findEntries,
    isCompleted,
    getPlatformUserId,
    getRestartDates,
};
