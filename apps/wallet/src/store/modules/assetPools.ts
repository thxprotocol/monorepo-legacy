import { thxClient } from '@thxnetwork/wallet/utils/oidc';
import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';
import { RewardConditionInteraction } from '@thxnetwork/types/index';

function getItemUrl(withdrawCondition: { interaction: RewardConditionInteraction; content: string }) {
    if (!withdrawCondition) return;

    const { interaction, content } = withdrawCondition;
    let itemUrl;

    switch (interaction) {
        case RewardConditionInteraction.YouTubeLike:
            itemUrl = {
                href: `https://www.youtube.com/watch?v=${content}`,
                label: 'liked this video',
            };
            break;
        case RewardConditionInteraction.YouTubeSubscribe:
            itemUrl = {
                href: `https://www.youtube.com/channel/${content}`,
                label: 'subscribed to this channel',
            };
            break;
        case RewardConditionInteraction.TwitterLike:
            itemUrl = {
                href: `https://www.twitter.com/twitter/status/${content}`,
                label: 'liked this tweet',
            };
            break;
        case RewardConditionInteraction.TwitterRetweet:
            itemUrl = {
                href: `https://www.twitter.com/twitter/status/${content}`,
                label: 'retweeted this tweet',
            };
            break;
        case RewardConditionInteraction.TwitterFollow:
            itemUrl = {
                href: `https://www.twitter.com/i/user/${content}`,
                label: 'follow this account',
            };
            break;
    }
    return itemUrl;
}

@Module({ namespaced: true })
class AssetPoolModule extends VuexModule {
    @Action({ rawError: true })
    async getERC721Perk({ rewardUuid, poolId }: { rewardUuid: string; poolId: string }) {
        const data = await thxClient.erc721.getReward({ poolId, rewardUuid });
        return data;
    }

    @Action({ rawError: true })
    async getERC20Perk({ rewardUuid, poolId }: { rewardUuid: string; poolId: string }) {
        const data = await thxClient.erc20.getReward({ poolId, rewardUuid });
        return data;
    }

    @Action({ rawError: true })
    async getClaim(claimUuid: string) {
        const data = await thxClient.claims.get(claimUuid);
        return data;
    }

    @Action({ rawError: true })
    async claimReward(claimUuid: string) {
        const claim = await this.context.dispatch('getClaim', claimUuid);
        const data = await thxClient.claims.collect({ poolId: claim.claim.poolId, claimUuid });
        return data;
    }
}

export default AssetPoolModule;
