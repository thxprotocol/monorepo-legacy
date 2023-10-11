import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { TAccount, TPointReward } from '@thxnetwork/types/interfaces';
import { RewardConditionPlatform, RewardConditionInteraction } from '@thxnetwork/types/enums';

export const validateCondition = async (account: TAccount, reward: TPointReward): Promise<string> => {
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
                    const userId = await getPlatformUserId(account, reward);
                    return `Discord: User #${userId} has not joined Discord server #${reward.content}.`;
                }
                break;
            }
        }
    } catch (error) {
        return 'We were unable to confirm the requirements for this quest.';
    }
};

export const getPlatformUserId = async (account: TAccount, reward: TPointReward) => {
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
