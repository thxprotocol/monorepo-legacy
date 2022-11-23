import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { Claim } from '@thxnetwork/api/models/Claim';
import { TClaim } from '@thxnetwork/api/types/TClaim';
import AssetPoolService from './AssetPoolService';
import db from '@thxnetwork/api/util/database';
import { RewardBaseDocument } from '../models/RewardBase';

export default {
    create: (data: { poolId: string; rewardId: string; erc20Id?: string; erc721Id?: string }) => {
        const claim = { id: db.createUUID(), ...data } as TClaim;
        return Claim.create(claim);
    },
    findById: (id: string) => {
        return Claim.findOne({ id });
    },
    findByPool: (pool: AssetPoolDocument) => {
        return Claim.find({ poolId: String(pool._id) });
    },
    findByReward: (reward: RewardBaseDocument) => {
        return Claim.find({ rewardId: reward.id, poolId: reward.poolId });
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
        return Claim.findOne({ rewardId, poolId });
    },
};
