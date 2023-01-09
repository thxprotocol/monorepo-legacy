import { NotFoundError } from '@thxnetwork/api/util/errors';
import db from '@thxnetwork/api/util/database';
import { MilestonePerk as TMilestonePerk } from '@thxnetwork/types/';
import { AssetPoolDocument } from '../models/AssetPool';
import { MilestonePerk, MilestonePerkDocument } from '../models/MilestonePerk';
import { TAssetPool } from '../types/TAssetPool';
import { paginatedResults } from '../util/pagination';

export default {
    async get(uuid: string) {
        return await MilestonePerk.findById(uuid);
    },

    async getAll(assetPool: TAssetPool): Promise<MilestonePerkDocument[]> {
        return MilestonePerk.find({ poolAddress: assetPool.address });
    },

    async create(pool: AssetPoolDocument, payload: Partial<TMilestonePerk>) {
        return await MilestonePerk.create({
            poolId: String(pool._id),
            uuid: db.createUUID(),
            ...payload,
        });
    },

    async edit(uuid: string, payload: Partial<TMilestonePerk>) {
        const reward = await MilestonePerk.findById(uuid);
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
        const reward = await MilestonePerk.findById(uuid);
        if (!reward) throw new NotFoundError('Cannot find Milestone Perk with this UUID')
        
    },

    async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const result = await paginatedResults(MilestonePerk, page, limit, {
            poolId: assetPool._id,
        });
        result.results = result.results.map((r) => r.toJSON());
        return result;
    },
};
