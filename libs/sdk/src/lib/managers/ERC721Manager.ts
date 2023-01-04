import { THXClient } from '../../index';
import { RewardConditionInteraction } from '../constants/RewardConditionInteraction';
import BaseManager from './BaseManager';

class ERC721Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(params: { chainId: string }) {
        const obj = new URLSearchParams(params);
        return await this.client.request.get(`/v1/erc721/token?${obj.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc721/token/${id}`);
    }

    async getContract(id: string) {
        const res = await this.client.request.get(`/v1/erc721/${id}`);
        return res;
    }

    async getMetadata(erc721Id: string, metadataId: string) {
        const res = await this.client.request.get(`/v1/erc721/${erc721Id}/metadata/${metadataId}`);
        return res;
    }

    async getReward({ perkUuid, poolId }: { perkUuid: string; poolId: string }) {
        const data = await this.client.request.get(`/v1/erc721-perks/${perkUuid}`, {
            headers: { 'X-PoolId': poolId },
        });
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
