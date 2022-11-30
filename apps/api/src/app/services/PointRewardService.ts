import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { PointReward as PointRewardDocument } from '@thxnetwork/api/models/PointReward';
import { paginatedResults } from '../util/pagination';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(PointReward, page, limit, { poolId: pool._id });
}

export const PointReward = PointRewardDocument;

export default { findByPool };
