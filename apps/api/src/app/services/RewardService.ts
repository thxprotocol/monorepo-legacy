import type { IAccount } from '@thxnetwork/api/models/Account';
import {
    ChannelAction,
    IRewardCondition,
    IRewardUpdates,
    Reward,
    RewardDocument,
    RewardState,
    TReward,
} from '@thxnetwork/api/models/Reward';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';
import YouTubeDataProxy from '@thxnetwork/api/proxies/YoutubeDataProxy';
import WithdrawalService from './WithdrawalService';
import ERC721Service from './ERC721Service';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import db from '@thxnetwork/api/util/database';
import { TPointReward } from '../models/PointReward';

export default class RewardService {
    static async get(assetPool: AssetPoolDocument, rewardId: string): Promise<RewardDocument> {
        const reward = await Reward.findOne({ poolId: String(assetPool._id), id: rewardId });
        if (!reward) return null;
        return reward;
    }

    static async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const rewards = [];

        const results = await paginatedResults(Reward, page, limit, { poolId: String(assetPool._id) });

        for (const r of results.results) {
            rewards.push(await this.get(assetPool, r.id));
        }

        results.results = rewards.map((r) => r.toJSON());

        return results;
    }

    static async canClaim(
        assetPool: AssetPoolDocument,
        reward: TReward,
        account: IAccount,
    ): Promise<{ result?: boolean; error?: string }> {
        // Can not claim if the reward is disabled
        if (reward.state === RewardState.Disabled) {
            return { error: 'This reward has been disabled' };
        }

        // Can not claim if reward already extends the claim limit
        // (included pending withdrawals)
        if (reward.withdrawLimit > 0) {
            const withdrawals = await WithdrawalService.findByQuery({
                poolId: String(assetPool._id),
                rewardId: reward.id,
            });
            if (withdrawals.length >= reward.withdrawLimit) {
                return { error: 'This reward is reached it limit' };
            }
        }

        if (reward.expiryDate) {
            const expiryTimestamp = new Date(reward.expiryDate).getTime();
            if (Date.now() > expiryTimestamp) return { error: 'This reward URL has expired' };
        }

        if (reward.erc721metadataId) {
            const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
            const tokensForSub = await ERC721Service.findTokensByMetadataAndSub(reward.erc721metadataId, account);

            // Can only claim this reward once, metadata exists, but is not minted
            if (reward.isClaimOnce && tokensForSub.length) {
                return { error: 'You have already claimed this NFT' };
            }

            const tokens = await ERC721Service.findTokensByMetadata(metadata);
            if (reward.withdrawLimit > 0 && tokens.length >= reward.withdrawLimit) {
                return { error: 'This NFT has already been claimed' };
            }
        } else {
            const withdrawal = await WithdrawalService.hasClaimedOnce(String(assetPool._id), account.id, reward.id);

            // Can only claim this reward once and a withdrawal already exists
            if (reward.isClaimOnce && withdrawal) {
                return { error: 'You have already claimed this reward' };
            }
        }

        // Can claim if no condition and channel are set
        if (!reward.withdrawCondition || !reward.withdrawCondition.channelType) {
            return { result: true };
        }

        return this.validateCondition(
            account,
            reward.withdrawCondition.channelAction,
            reward.withdrawCondition.channelItem,
        );
    }

    static async removeAllForPool(pool: AssetPoolDocument) {
        const rewards = await Reward.find({ poolId: String(pool._id) });
        for (const r of rewards) {
            await r.remove();
        }
    }

    static async create(
        assetPool: AssetPoolDocument,
        data: {
            title: string;
            slug: string;
            withdrawLimit: number;
            withdrawAmount: number;
            withdrawDuration: number;
            isMembershipRequired: boolean;
            isClaimOnce: boolean;
            withdrawUnlockDate: Date;
            withdrawCondition?: IRewardCondition;
            expiryDate?: Date;
            erc721metadataId?: string;
            amount?: number;
        },
    ) {
        const expiryDateObj = data.expiryDate && new Date(data.expiryDate);
        return Reward.create({
            title: data.title,
            slug: data.slug,
            expiryDate: expiryDateObj,
            poolId: String(assetPool._id),
            withdrawAmount: String(data.withdrawAmount),
            erc721metadataId: data.erc721metadataId,
            withdrawLimit: data.withdrawLimit,
            withdrawDuration: data.withdrawDuration,
            withdrawCondition: data.withdrawCondition,
            withdrawUnlockDate: data.withdrawUnlockDate,
            state: RewardState.Enabled,
            isMembershipRequired: data.isMembershipRequired,
            isClaimOnce: data.isClaimOnce,
            amount: data.amount || 1,
            id: db.createUUID(),
        });
    }

    static update(reward: RewardDocument, updates: IRewardUpdates) {
        return Reward.findByIdAndUpdate(reward._id, updates, { new: true });
    }

    static async validateCondition(
        account: IAccount,
        channelAction: ChannelAction,
        channelItem: string,
    ): Promise<{ result?: boolean; error?: string }> {
        switch (channelAction) {
            case ChannelAction.YouTubeLike: {
                const result = await YouTubeDataProxy.validateLike(account, channelItem);
                if (!result) return { error: 'Youtube: Video has not been liked.' };
                break;
            }
            case ChannelAction.YouTubeSubscribe: {
                const result = await YouTubeDataProxy.validateSubscribe(account, channelItem);
                if (!result) return { error: 'Youtube: Not subscribed to channel.' };
                break;
            }
            case ChannelAction.TwitterLike: {
                const result = await TwitterDataProxy.validateLike(account, channelItem);
                if (!result) return { error: 'Twitter: Tweet has not been liked.' };
                break;
            }
            case ChannelAction.TwitterRetweet: {
                const result = await TwitterDataProxy.validateRetweet(account, channelItem);
                if (!result) return { error: 'Twitter: Tweet is not retweeted.' };
                break;
            }
            case ChannelAction.TwitterFollow: {
                const result = await TwitterDataProxy.validateFollow(account, channelItem);
                if (!result) return { error: 'Twitter: Account is not followed.' };
                break;
            }
        }
        return { result: true };
    }
}
