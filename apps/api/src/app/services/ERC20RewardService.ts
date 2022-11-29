import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ERC20Reward, ERC20RewardDocument } from '../models/ERC20Reward';
import { TERC20Reward } from '@thxnetwork/types/index';

export async function get(rewardId: string): Promise<ERC20RewardDocument> {
    return await ERC20Reward.findById(rewardId);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const result = await paginatedResults(ERC20Reward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function removeAllForPool(assetPool: AssetPoolDocument) {
    const rewards = await ERC20Reward.find({ poolId: assetPool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC20Reward) {
    return await ERC20Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC20RewardDocument, payload: TERC20Reward) {
    return await ERC20Reward.findByIdAndUpdate(reward._id, payload, { new: true });
}

export default { get, findByPool, removeAllForPool, create, update };
