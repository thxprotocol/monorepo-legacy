import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';
import { RewardConditionInteraction } from '../types/Rewards';

class ERC20Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(props: { chainId: string }) {
        const params = new URLSearchParams(props);
        return await this.client.request.get(`/v1/erc20/token?${params.toString()}`);
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc20/token/${id}`);
    }

    async getContract(id: string) {
        return await this.client.request.get(`/v1/erc20/${id}`);
    }

    async transfer(config: { erc20Id: string; to: string; amount: string; chainId: ChainId }) {
        return await this.client.request.post(`/v1/erc20/transfer`, { body: JSON.stringify(config) });
    }

    async getReward({ rewardUuid, poolId }: { rewardUuid: string; poolId: string }) {
        const data = await this.client.request.get(`/v1/erc20-perks/${rewardUuid}`, {
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

export default ERC20Manager;
