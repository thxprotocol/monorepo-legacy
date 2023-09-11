import { RewardConditionPlatform } from '@thxnetwork/types/enums';
import { AccountVariant } from '../types/enums/AccountVariant';

function shortenAddress(address: string) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`;
}

const platformIconMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.Google]: 'fab fa-youtube',
    [RewardConditionPlatform.Twitter]: 'fab fa-twitter',
    [RewardConditionPlatform.Discord]: 'fab fa-discord',
};

const platformAccessKeyMap: any = {
    [RewardConditionPlatform.None]: '',
    [RewardConditionPlatform.Google]: 'youtubeManageAccess',
    [RewardConditionPlatform.Twitter]: 'twitterAccess',
    [RewardConditionPlatform.Discord]: 'discordAccess',
    [RewardConditionPlatform.Github]: 'githubAccess',
    [RewardConditionPlatform.Twitch]: 'twitchAccess',
};

const platformAccountVariantMap: any = {
    [RewardConditionPlatform.Twitter]: AccountVariant.SSOTwitter,
    [RewardConditionPlatform.Discord]: AccountVariant.SSODiscord,
    [RewardConditionPlatform.Github]: AccountVariant.SSOGithub,
    [RewardConditionPlatform.Twitch]: AccountVariant.SSOTwitch,
};

export { shortenAddress, platformAccessKeyMap, platformAccountVariantMap, platformIconMap };
