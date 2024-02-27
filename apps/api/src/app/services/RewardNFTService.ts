import { PoolDocument, RewardNFT, RewardNFTDocument } from '@thxnetwork/api/models';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { v4 } from 'uuid';

export async function get(id: string): Promise<RewardNFTDocument> {
    return await RewardNFT.findById(id);
}

export async function findByPool(assetPool: PoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(RewardNFT, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(pool: PoolDocument) {
    await RewardNFT.deleteMany({ poolId: pool._id });
}

export async function create(pool: PoolDocument, payload: TRewardNFT) {
    return await RewardNFT.create({
        poolId: String(pool._id),
        uuid: v4(),
        ...payload,
    });
}

export async function update(reward: RewardNFTDocument, updates: TRewardNFT) {
    return await RewardNFT.findByIdAndUpdate(reward._id, updates, { new: true });
}

export async function remove(reward: RewardNFTDocument) {
    return RewardNFT.findOneAndDelete(reward._id);
}

export default { get, findByPool, removeAllForPool, create, update, remove };
