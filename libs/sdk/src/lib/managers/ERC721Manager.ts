import { RewardConditionInteraction } from '@thxnetwork/types/index';
import { THXClient } from '../../index';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        const res = await this.client.request.get(`/v1/erc721/token?${obj.toString()}`);
        return await res.json();
    }

    async get(id: string) {
        const res = await this.client.request.get(`/v1/erc721/token/${id}`);
        return await res.json()
    }

    async getContract(id: string) {
        const res = await this.client.request.get(`/v1/erc721/${id}`);
        return await res.json();
    }

    async getMetadata(erc721Id: string, metadataId: string) {
        const res = await this.client.request.get(`/erc721/${erc721Id}/metadata/${metadataId}`);
        return await res.json();
    }

    async getReward({ rewardId, poolId }: { rewardId: string; poolId: string }) {
        const res = await this.client.request.get(`/erc721-rewards/${rewardId}`, {
            headers: { 'X-PoolId': poolId },
        });
        const data = await res.json();
        data.itemUrl = this.getItemUrl(data);
        return data;
    }

    /* Utils */
    async getItemUrl(withdrawCondition: { interaction: RewardConditionInteraction; content: string }) {
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
}

export default ERC721Manager;
