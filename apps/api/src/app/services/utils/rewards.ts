import { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ChannelAction, RewardState } from '@thxnetwork/api/models/Reward';
import { RewardConditionDocument } from '@thxnetwork/api/types/RewardCondition';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import WithdrawalService from '../WithdrawalService';
import { RewardVariant } from '@thxnetwork/api/types/enums/RewardVariant';
import { RewardBase, RewardBaseDocument } from '@thxnetwork/api/models/RewardBase';
import db from '@thxnetwork/api/util/database';

export const validateCondition = async (
    account: IAccount,
    rewardCondition: RewardConditionDocument,
): Promise<{ result?: boolean; error?: string }> => {
    switch (rewardCondition.channelAction) {
        case ChannelAction.YouTubeLike: {
            const result = await YouTubeDataProxy.validateLike(account, rewardCondition.channelItem);
            if (!result) return { error: 'Youtube: Video has not been liked.' };
            break;
        }
        case ChannelAction.YouTubeSubscribe: {
            const result = await YouTubeDataProxy.validateSubscribe(account, rewardCondition.channelItem);
            if (!result) return { error: 'Youtube: Not subscribed to channel.' };
            break;
        }
        case ChannelAction.TwitterLike: {
            const result = await TwitterDataProxy.validateLike(account, rewardCondition.channelItem);
            if (!result) return { error: 'Twitter: Tweet has not been liked.' };
            break;
        }
        case ChannelAction.TwitterRetweet: {
            const result = await TwitterDataProxy.validateRetweet(account, rewardCondition.channelItem);
            if (!result) return { error: 'Twitter: Tweet is not retweeted.' };
            break;
        }
        case ChannelAction.TwitterFollow: {
            const result = await TwitterDataProxy.validateFollow(account, rewardCondition.channelItem);
            if (!result) return { error: 'Twitter: Account is not followed.' };
            break;
        }
    }
    return { result: true };
};

export const validateRewardBase = async (
    assetPool: AssetPoolDocument,
    reward: RewardBaseDocument,
    account: IAccount,
): Promise<{ result?: boolean; error?: string }> => {
    // Can not claim if the reward is disabled
    if (reward.state === RewardState.Disabled) {
        return { error: 'This reward has been disabled' };
    }

    // Can not claim if reward already extends the claim limit
    // (included pending withdrawals)
    if (reward.limit > 0) {
        const withdrawals = await WithdrawalService.findByQuery({
            poolId: String(assetPool._id),
            rewardId: reward.id,
        });
        if (withdrawals.length >= reward.limit) {
            return { error: 'This reward is reached it limit' };
        }
    }

    if (reward.expiryDate) {
        const expiryTimestamp = new Date(reward.expiryDate).getTime();
        if (Date.now() > expiryTimestamp) return { error: 'This reward URL has expired' };
    }

    if (reward.isClaimOnce) {
        const hasClaimedOnce = await WithdrawalService.hasClaimedOnce(String(assetPool._id), account.id, reward.id);

        // Can only claim this reward once and a withdrawal already exists
        if (reward.isClaimOnce && hasClaimedOnce) {
            return { error: 'You have already claimed this reward' };
        }
    }

    return { result: true };
};

export const createRewardBase = async (
    assetPool: AssetPoolDocument,
    variant: RewardVariant,
    data: {
        title: string;
        slug: string;
        limit: number;
        expiryDate: Date;
        amount: number;
        isClaimOnce: boolean;
    },
) => {
    const expiryDateObj = data.expiryDate && new Date(data.expiryDate);
    return RewardBase.create({
        id: db.createUUID(),
        title: data.title,
        slug: data.slug,
        variant,
        poolId: assetPool._id,
        limit: data.limit,
        expiryDate: expiryDateObj,
        state: RewardState.Enabled,
        amount: data.amount,
        isClaimOnce: data.isClaimOnce,
    });
};
