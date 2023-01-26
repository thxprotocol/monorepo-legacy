import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointReward as PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TPointReward } from '@thxnetwork/types/interfaces/PointReward';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TPointReward>) {
    await PointReward.create({
        uuid: db.createUUID(),
        poolId: pool._id,
        ...payload,
    });
}

export const PointReward = PointRewardDocument;

export default { findByPool, create };
