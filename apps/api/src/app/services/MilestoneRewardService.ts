import { NotFoundError } from '@thxnetwork/api/util/errors';
import db from '@thxnetwork/api/util/database';
import { TMilestoneReward } from '@thxnetwork/types';
import { AssetPoolDocument } from '../models/AssetPool';
import { MilestoneReward, MilestoneRewardDocument } from '../models/MilestoneReward';
import { TAssetPool } from '../types/TAssetPool';
import { paginatedResults } from '../util/pagination';

export default {
    async get(uuid: string) {
        return await MilestoneReward.findById(uuid);
    },

    async getAll(assetPool: TAssetPool): Promise<MilestoneRewardDocument[]> {
        return MilestoneReward.find({ poolAddress: assetPool.address });
    },

    async create(pool: AssetPoolDocument, payload: Partial<TMilestoneReward>) {
        return await MilestoneReward.create({
            poolId: String(pool._id),
            uuid: db.createUUID(),
            ...payload,
        });
    },

    async edit(uuid: string, payload: Partial<TMilestoneReward>) {
        const reward = await MilestoneReward.findById(uuid);
        if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID')

        Object.keys(payload).forEach(key => {
            if (payload[key]) {
                reward[key] = payload[key]
            }
        })

        await reward.save()
        return reward;
    },

    async delete(uuid: string) {
        const reward = await MilestoneReward.findById(uuid);
        if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID')
        
    },

    async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const result = await paginatedResults(MilestoneReward, page, limit, {
            poolId: assetPool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    },
};
