import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';

async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ReferralReward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

async function removeAllForPool(pool: AssetPoolDocument) {
    await ReferralReward.deleteMany({ poolId: pool._id });
}

async function remove(reward: ReferralRewardDocument) {
    const deleteResult = ReferralReward.findOneAndDelete(reward._id);
    await ReferralRewardClaim.deleteMany({ referralRewardId: reward._id });
    return deleteResult;
}

export default { findByPool, removeAllForPool, remove };
