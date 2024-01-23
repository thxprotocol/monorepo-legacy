import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { AssetPool } from '../models/AssetPool';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';

export async function updateCampaignRanks() {
    try {
        const campaigns = await AssetPool.aggregate([
            {
                $addFields: {
                    id: { $toString: '$_id' },
                },
            },
            {
                $lookup: {
                    from: 'participants',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'participants',
                },
            },
            // Rewards
            {
                $lookup: {
                    from: 'erc20perks',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'erc20Perks',
                },
            },
            {
                $lookup: {
                    from: 'erc721perks',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'erc721Perks',
                },
            },
            {
                $lookup: {
                    from: 'customrewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'customRewards',
                },
            },
            {
                $lookup: {
                    from: 'couponrewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'couponRewards',
                },
            },
            {
                $lookup: {
                    from: 'discordrolerewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'discordRoleRewards',
                },
            },
            // Quests
            {
                $lookup: {
                    from: 'dailyrewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'dailyquests',
                },
            },
            {
                $lookup: {
                    from: 'referralrewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'invitequests',
                },
            },
            {
                $lookup: {
                    from: 'pointrewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'socialquests',
                },
            },
            {
                $lookup: {
                    from: 'milestonerewards',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'customquests',
                },
            },
            {
                $lookup: {
                    from: 'web3quests',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'web3quests',
                },
            },
            {
                $lookup: {
                    from: 'gitcoinquests',
                    localField: 'id',
                    foreignField: 'poolId',
                    as: 'gitcoinquests',
                },
            },
            {
                $addFields: {
                    participantCount: { $size: '$participants' },
                    totalQuestCount: {
                        $size: {
                            $concatArrays: [
                                '$dailyquests',
                                '$invitequests',
                                '$socialquests',
                                '$customquests',
                                '$web3quests',
                                '$gitcoinquests',
                            ],
                        },
                    },
                    totalRewardsCount: {
                        $size: {
                            $concatArrays: [
                                '$erc20Perks',
                                '$erc721Perks',
                                '$customRewards',
                                '$couponRewards',
                                '$discordRoleRewards',
                            ],
                        },
                    },
                },
            },
            {
                $match: {
                    'settings.isPublished': true,
                    'chainId': NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat,
                    'totalQuestCount': { $gt: 0 },
                    'totalRewardsCount': { $gt: 0 },
                },
            },
            {
                $sort: { participantCount: -1 },
            },
        ]).exec();

        await AssetPool.bulkWrite(
            campaigns.map((campaign, index) => {
                return {
                    updateOne: {
                        filter: { _id: campaign._id },
                        update: { $set: { rank: Number(index) + 1 } },
                    },
                };
            }),
        );
    } catch (error) {
        logger.error(error);
    }
}
