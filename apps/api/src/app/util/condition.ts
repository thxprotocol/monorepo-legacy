import { IAccount } from '@thxnetwork/api/models/Account';
import { RewardConditionInteraction, TBaseReward } from '@thxnetwork/types/index';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';

export const validateCondition = async (
    account: IAccount,
    reward: TBaseReward,
): Promise<{ result?: boolean; error?: string }> => {
    switch (reward.interaction) {
        case RewardConditionInteraction.YouTubeLike: {
            const result = await YouTubeDataProxy.validateLike(account, reward.content);
            if (!result) return { error: 'Youtube: Video has not been liked.' };
            break;
        }
        case RewardConditionInteraction.YouTubeSubscribe: {
            const result = await YouTubeDataProxy.validateSubscribe(account, reward.content);
            if (!result) return { error: 'Youtube: Not subscribed to channel.' };
            break;
        }
        case RewardConditionInteraction.TwitterLike: {
            const result = await TwitterDataProxy.validateLike(account, reward.content);
            if (!result) return { error: 'Twitter: Tweet has not been liked.' };
            break;
        }
        case RewardConditionInteraction.TwitterRetweet: {
            const result = await TwitterDataProxy.validateRetweet(account, reward.content);
            if (!result) return { error: 'Twitter: Tweet is not retweeted.' };
            break;
        }
        case RewardConditionInteraction.TwitterFollow: {
            const result = await TwitterDataProxy.validateFollow(account, reward.content);
            if (!result) return { error: 'Twitter: Account is not followed.' };
            break;
        }
    }
    return { result: true };
};
