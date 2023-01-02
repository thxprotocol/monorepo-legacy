import { THXClient } from '../../index';
import BaseManager from './BaseManager';
import { ChainId } from '../types/enums/ChainId';
import { RewardConditionInteraction } from '../constants/RewardConditionInteraction';

class ERC20Manager extends BaseManager {
    constructor(client: THXClient) {
        super(client);
    }

    async list(props: { chainId: string }) {
        const params = new URLSearchParams(props);
        const res = await this.client.request.get(`/v1/erc20/token?${params.toString()}`);
        return res;
    }

    async get(id: string) {
        return await this.client.request.get(`/v1/erc20/token/${id}`);
    }

    async getContract(id: string) {
        const res = await this.client.request.get(`/v1/erc20/${id}`);
        return res;
    }

    async transferFrom(erc20: string, from: string, to: string, amount: string, chainId: ChainId) {
        const params = new URLSearchParams();
        params.append('erc20', erc20);
        params.append('from', from);
        params.append('to', to);
        params.append('amount', amount);
        params.append('chainId', chainId.toString());
        return await this.client.request.post(`/v1/erc20/transfer`, { body: params });
    }

    async getReward({ rewardUuid, poolId }: { rewardUuid: string; poolId: string }) {
        const data = await this.client.request.get(`/erc20-rewards/${rewardUuid}`, {
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
