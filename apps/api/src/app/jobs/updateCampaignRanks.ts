import { ChainId } from '@thxnetwork/common/lib/types/enums';
import { AssetPool } from '../models/AssetPool';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { logger } from '../util/logger';

export async function updateCampaignRanks() {
    try {
        const campaigns = await AssetPool.aggregate([
            {
                $match: {
                    'settings.isPublished': true,
                    'chainId': NODE_ENV === 'production' ? ChainId.Polygon : ChainId.Hardhat,
                },
            },
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
            {
                $addFields: {
                    participantCount: { $size: '$participants' },
                },
            },
            {
                $sort: { participantCount: -1 },
            },
        ]).exec();
        console.log(campaigns);

        const updates = campaigns.map((campaign, index) => {
            return {
                updateOne: {
                    filter: { _id: campaign._id },
                    update: { $set: { rank: Number(index) + 1 } },
                },
            };
        });
        console.log(updates);

        await AssetPool.bulkWrite(updates);
    } catch (error) {
        logger.error(error);
    }
}
