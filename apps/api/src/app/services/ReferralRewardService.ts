import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { TReferralReward } from '@thxnetwork/types/index';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';

export async function get(id: string): Promise<ReferralRewardDocument> {
    return await ReferralReward.findById(id);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ReferralReward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(pool: AssetPoolDocument) {
    const rewards = await ReferralReward.find({ poolId: pool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TReferralReward) {
    return await ReferralReward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ReferralRewardDocument, updates: TReferralReward) {
    return await ReferralReward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export async function remove(reward: ReferralRewardDocument) {
    const deleteResult = ReferralReward.findOneAndDelete(reward._id);
    await ReferralRewardClaim.deleteMany({ referralRewardId: reward._id });
    return deleteResult;
}

export default { get, findByPool, removeAllForPool, create, update, remove };
