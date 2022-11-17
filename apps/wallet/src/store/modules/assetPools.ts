import axios from 'axios';
import { Module, VuexModule, Action } from 'vuex-module-decorators';

export enum ChannelAction {
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
}

interface SignedCall {
    call: string;
    nonce: number;
    sig: string;
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
    async getReward({ rewardId, poolId }: { rewardId: string; poolId: string }) {
        const { data } = await axios({
            method: 'GET',
            url: `/rewards/${rewardId}`,
            headers: { 'X-PoolId': poolId },
        });
        if (data.withdrawCondition) {
            let itemUrl;
            const { channelAction, channelItem } = data.withdrawCondition;
            switch (channelAction) {
                case ChannelAction.YouTubeLike:
                    itemUrl = {
                        href: `https://www.youtube.com/watch?v=${channelItem}`,
                        label: 'liked this video',
                    };
                    break;
                case ChannelAction.YouTubeSubscribe:
                    itemUrl = {
                        href: `https://www.youtube.com/channel/${channelItem}`,
                        label: 'subscribed to this channel',
                    };
                    break;
                case ChannelAction.TwitterLike:
                    itemUrl = {
                        href: `https://www.twitter.com/twitter/status/${channelItem}`,
                        label: 'liked this tweet',
                    };
                    break;
                case ChannelAction.TwitterRetweet:
                    itemUrl = {
                        href: `https://www.twitter.com/twitter/status/${channelItem}`,
                        label: 'retweeted this tweet',
                    };
                    break;
                case ChannelAction.TwitterFollow:
                    itemUrl = {
                        href: `https://www.twitter.com/i/user/${channelItem}`,
                        label: 'follow this account',
                    };
                    break;
            }
            data.itemUrl = itemUrl;
        }

        return data;
    }

    @Action({ rawError: true })
    async getClaim({ rewardHash, claimId }: { rewardHash: string; claimId: string }) {
        if (rewardHash) {
            const { data } = await axios({
                method: 'GET',
                url: `/claims/hash/${rewardHash}`,
            });
            return data;
        }
        if (claimId) {
            const { data } = await axios({
                method: 'GET',
                url: `/claims/${claimId}`,
            });
            return data;
        }
    }

    @Action({ rawError: true })
    async claimReward({ rewardHash, claimId }: { rewardHash: string; claimId: string }) {
        const claim = await this.context.dispatch('getClaim', { rewardHash, claimId });
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
