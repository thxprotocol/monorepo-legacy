import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ShopifyPerk, ShopifyPerkDocument } from '../models/ShopifyPerk';
import { TShopifyPerk } from '@thxnetwork/types/index';

export async function get(rewardUuid: string): Promise<ShopifyPerkDocument> {
    return await ShopifyPerk.findById(rewardUuid);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const result = await paginatedResults(ShopifyPerk, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(assetPool: AssetPoolDocument) {
    const rewards = await ShopifyPerk.find({ poolId: assetPool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TShopifyPerk) {
    return await ShopifyPerk.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ShopifyPerkDocument, payload: TShopifyPerk) {
    return await ShopifyPerk.findByIdAndUpdate(reward._id, payload, { new: true });
}

export async function remove(reward: ShopifyPerkDocument) {
    return await ShopifyPerk.findOneAndDelete(reward._id);
}

export default { get, findByPool, removeAllForPool, create, update, remove };
