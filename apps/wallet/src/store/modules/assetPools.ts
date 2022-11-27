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
    async upgradeAddress({ poolId, newAddress, data }: { poolId: string; newAddress: string; data: SignedCall }) {
        const r = await axios({
            method: 'POST',
            url: '/gas_station/upgrade_address',
            headers: {
                'X-PoolId': poolId,
            },
            data: { newAddress, ...data },
        });

        if (r.status !== 200) {
            throw new Error('POST upgrade address failed.');
        }

        return r.data;
    }

    @Action({ rawError: true })
    async getERC721Reward({ rewardId, poolId }: { rewardId: string; poolId: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/erc721-rewards/${rewardId}`,
            headers: { 'X-PoolId': poolId },
        });
        data.itemUrl = getItemUrl(data);
        return data;
    }

    @Action({ rawError: true })
    async getERC20Reward({ rewardId, poolId }: { rewardId: string; poolId: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/erc20-rewards/${rewardId}`,
            headers: { 'X-PoolId': poolId },
        });
        data.itemUrl = getItemUrl(data);
        return data;
    }

    @Action({ rawError: true })
    async getClaim(claimId: string) {
        const { data } = await axios({
            method: 'GET',
            url: `/claims/${claimId}`,
        });
        return data;
    }

    @Action({ rawError: true })
    async claimReward(claimId: string) {
        const claim = await this.context.dispatch('getClaim', claimId);
        const r = await axios({
            method: 'POST',
            url: `/claims/${claim.id}/collect`,
            headers: { 'X-PoolId': claim.poolId },
            params: { forceSync: false },
        });

        return r.data;
    }
}

export default AssetPoolModule;
