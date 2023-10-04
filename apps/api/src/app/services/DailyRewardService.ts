import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { DailyReward as DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(DailyReward, page, limit, { poolId: pool._id });
}

export function findByUUID(uuid: string) {
    return DailyReward.findOne({ uuid });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TDailyReward>) {
    return await DailyReward.create({
        poolId: pool._id,
        ...payload,
    });
}

export const DailyReward = DailyRewardDocument;

export default { findByPool, findByUUID, create };
