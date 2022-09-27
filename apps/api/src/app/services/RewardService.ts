import { IAccount } from '@thxnetwork/api/models/Account';
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
import SpotifyDataProxy from '@thxnetwork/api/proxies/SpotifyDataProxy';
import WithdrawalService from './WithdrawalService';
import ERC721Service from './ERC721Service';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';

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
        // (included pending withdrawars)
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

        const withdrawal = await WithdrawalService.hasClaimedOnce(String(assetPool._id), account.id, reward.id);

        // Can only claim this reward once and a withdrawal already exists
        if (reward.isClaimOnce && withdrawal) {
            return { error: 'You have already claimed this reward' };
        }

        const token = await ERC721Service.findTokenById(reward.erc721metadataId);

        // Can only claim this reward once, metadata exists, but is not minted
        if (reward.isClaimOnce && token && !!token.tokenId) {
            return {
                error:
                    token.recipient === account.address
                        ? 'You have already claimed this NFT'
                        : 'Someone has already claimed this NFT',
            };
        }

        // Can claim if no condition and channel are set
        if (!reward.withdrawCondition || !reward.withdrawCondition.channelType) {
            return { result: true };
        }

        return await this.validate(
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
        const reward = await Reward.create({
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
        });

        // Store in id to minimize regresion. Remove when old style QR's are no longer going around.
        reward.id = String(reward._id);
        return await reward.save();
    }

    static update(reward: RewardDocument, updates: IRewardUpdates) {
        return Reward.findByIdAndUpdate(reward._id, updates, { new: true });
    }

    static async validate(
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
            case ChannelAction.SpotifyUserFollow: {
                const result = await SpotifyDataProxy.validateUserFollow(account, channelItem);
                if (!result) return { error: 'Spotify: User not followed.' };
                break;
            }
            case ChannelAction.SpotifyPlaylistFollow: {
                const result = await SpotifyDataProxy.validatePlaylistFollow(account, channelItem);
                if (!result) return { error: 'Spotify: Playlist is not followed.' };
                break;
            }
            case ChannelAction.SpotifyTrackPlaying: {
                const result = await SpotifyDataProxy.validateTrackPlaying(account, channelItem);
                if (!result) return { error: 'Spotify: Track is not playing.' };
                break;
            }
            case ChannelAction.SpotifyTrackRecent: {
                const result = await SpotifyDataProxy.validateRecentTrack(account, channelItem);
                if (!result) return { error: 'Spotify: Track not found in recent tracks.' };
                break;
            }
            case ChannelAction.SpotifyTrackSaved: {
                const result = await SpotifyDataProxy.validateSavedTracks(account, channelItem);
                if (!result) return { error: 'Spotify: Track not saved.' };
                break;
            }
        }
        return { result: true };
    }
}
