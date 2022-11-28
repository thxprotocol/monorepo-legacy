import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { TERC721Reward } from '@thxnetwork/types/index';
import { ERC721Reward, ERC721RewardDocument } from '@thxnetwork/api/models/ERC721Reward';

export async function get(id: string): Promise<ERC721RewardDocument> {
    return await ERC721Reward.findById(id);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ERC721Reward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(pool: AssetPoolDocument) {
    const rewards = await ERC721Reward.find({ poolId: pool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC721Reward) {
    return await ERC721Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC721RewardDocument, updates: TERC721Reward) {
    return await ERC721Reward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export default { get, findByPool, removeAllForPool, create, update };
