import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Claim } from '@thxnetwork/api/models/Claim';
import { RewardDocument } from '@thxnetwork/api/models/Reward';
import { TClaim } from '@thxnetwork/api/types/TClaim';
import AssetPoolService from './AssetPoolService';

export default {
    create: (claim: TClaim) => {
        return Claim.create(claim);
    },
    findById: (id: string) => {
        return Claim.findById(id);
    },
    findByPool: (pool: AssetPoolDocument) => {
        return Claim.find({ poolId: String(pool._id) });
    },
    findByReward: (reward: RewardDocument) => {
        return Claim.find({ rewardId: String(reward.id), poolId: reward.poolId });
    },
    findByHash: async (hash: string) => {
        const rewardData = JSON.parse(Buffer.from(hash, 'base64').toString());

        // With this statement we support hashes that dont contain a poolId
        if (!rewardData.poolId && rewardData.poolAddress) {
            const pool = await AssetPoolService.getByAddress(rewardData.poolAddress);
            if (!pool) return;
            rewardData.poolId = String(pool._id);
        }

        const { rewardId, poolId } = rewardData;
        return await Claim.findOne({ rewardId, poolId });
    },
};
