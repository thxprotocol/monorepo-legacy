import { IAccount } from '@thxnetwork/api/models/Account';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';

import { RewardConditionPlatform, RewardConditionInteraction, TBaseReward } from '@thxnetwork/types/index';

export const validateCondition = async (account: IAccount, reward: TBaseReward): Promise<string> => {
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
                if (!result) return 'Twitter: Tweet has not been liked.';
                break;
            }
            case RewardConditionInteraction.TwitterRetweet: {
                const result = await TwitterDataProxy.validateRetweet(account, reward.content);
                if (!result) return 'Twitter: Tweet is not retweeted.';
                break;
            }
            case RewardConditionInteraction.TwitterFollow: {
                const result = await TwitterDataProxy.validateFollow(account, reward.content);
                if (!result) return 'Twitter: Account is not followed.';
                break;
            }
            case RewardConditionInteraction.DiscordGuildJoined: {
                const { id, url } = JSON.parse(reward.content);
                const result = await DiscordDataProxy.validateGuildJoined(account, id);
                if (!result && url) return `Discord: Account not yet joined guild. Please join though following URL: ${url}`;
                else if (!result && !url) return `Discord: Account not yet joined guild. Please contact Perk Creator for Invitation link`;
                break;
            }
        }
    } catch (error) {
        return 'Could not validate the platform condition for this claim.';
    }
};
