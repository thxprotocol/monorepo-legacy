import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { TERC721Perk } from '@thxnetwork/types/index';
import { ERC721Perk, ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';

export async function get(id: string): Promise<ERC721PerkDocument> {
    return await ERC721Perk.findById(id);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ERC721Perk, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(pool: AssetPoolDocument) {
    await ERC721Perk.deleteMany({ poolId: pool._id });
}

export async function create(pool: AssetPoolDocument, payload: TERC721Perk) {
    return await ERC721Perk.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC721PerkDocument, updates: TERC721Perk) {
    return await ERC721Perk.findByIdAndUpdate(reward._id, updates, { new: true });
}

export async function remove(reward: ERC721PerkDocument) {
    return ERC721Perk.findOneAndDelete(reward._id);
}

export default { get, findByPool, removeAllForPool, create, update, remove };
