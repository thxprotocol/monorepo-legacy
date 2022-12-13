import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ERC20Perk, ERC20PerkDocument } from '../models/ERC20Perk';
import { TERC20Perk } from '@thxnetwork/types/index';

export async function get(rewardId: string): Promise<ERC20PerkDocument> {
    return await ERC20Perk.findById(rewardId);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const result = await paginatedResults(ERC20Perk, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(assetPool: AssetPoolDocument) {
    const rewards = await ERC20Perk.find({ poolId: assetPool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC20Perk) {
    return await ERC20Perk.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC20PerkDocument, payload: TERC20Perk) {
    return await ERC20Perk.findByIdAndUpdate(reward._id, payload, { new: true });
}

export async function remove(reward: ERC20PerkDocument) {
    return await ERC20Perk.findOneAndDelete(reward._id);
}

export default { get, findByPool, removeAllForPool, create, update, remove };
