import { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { ChannelAction, RewardState } from '@thxnetwork/api/models/Reward';
import { RewardNftDocument } from '@thxnetwork/api/models/RewardNft';
import { RewardTokenDocument } from '@thxnetwork/api/models/RewardToken';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import { RewardVariant } from '@thxnetwork/api/types/enums/RewardVariant';
import { RewardBaseDocument, TRewardBase } from '@thxnetwork/api/types/RewardBase';
import { RewardCondition, RewardConditionDocument } from '@thxnetwork/api/types/RewardCondition';
import { TRewardNft } from '@thxnetwork/api/types/RewardNft';
import WithdrawalService from '../WithdrawalService';

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

export const canClaim = async (
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

    const hasClaimedOnce = await WithdrawalService.hasClaimedOnce(String(assetPool._id), account.id, reward.id);

    // Can only claim this reward once and a withdrawal already exists
    if (hasClaimedOnce) {
        return { error: 'You have already claimed this reward' };
    }

    switch (reward.variant) {
        case RewardVariant.RewardNFT:
        case RewardVariant.RewardToken: {
            const typedReward: RewardNftDocument | RewardTokenDocument = await reward.getReward();

            if (!typedReward.rewardConditionId) {
                return { result: true };
            }

            const rewardCondition = await RewardCondition.findById(typedReward.rewardConditionId);

            return await validateCondition(account, rewardCondition);
        }

        default:
            return { result: true };
    }
};
