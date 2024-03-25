import { ChainId } from '@thxnetwork/common/enums';
import {
    Pool,
    RewardCoin,
    RewardNFT,
    RewardCustom,
    RewardCoupon,
    RewardDiscordRole,
    RewardGalachain,
    QuestDaily,
    QuestInvite,
    QuestSocial,
    QuestCustom,
    QuestWeb3,
    QuestGitcoin,
} from '@thxnetwork/api/models';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';

export async function updateCampaignRanks() {
    try {
        const questModels = [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin];
        const rewardModels = [RewardCoin, RewardNFT, RewardCustom, RewardCoupon, RewardDiscordRole, RewardGalachain];
        const questLookupStages = questModels.map((model) => {
            return {
                $lookup: {
                    from: model.collection.name,
                    localField: 'id',
                    foreignField: 'poolId',
                    as: model.collection.name,
                },
            };
        });
        const rewardLookupStages = rewardModels.map((model) => {
            return {
                $lookup: {
                    from: model.collection.name,
                    localField: 'id',
                    foreignField: 'poolId',
                    as: model.collection.name,
                },
            };
        });
        const campaigns = await Pool.aggregate([
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
            ...questLookupStages,
            ...rewardLookupStages,
            {
                $addFields: {
                    participantCount: { $size: '$participants' },
                    totalQuestCount: {
                        $size: {
                            $concatArrays: questModels.map((model) => `$${model.collection.name}`),
                        },
                    },
                    totalRewardsCount: {
                        $size: {
                            $concatArrays: rewardModels.map((model) => `$${model.collection.name}`),
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

        await Pool.bulkWrite(
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
