import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ReferralReward, ReferralRewardDocument } from '../models/ReferralReward';
import { RewardVariant } from '../types/enums/RewardVariant';
import { TReferralReward } from '@thxnetwork/types/';

export async function get(rewardId: string): Promise<ReferralRewardDocument> {
    return await ReferralReward.findById(rewardId);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const rewardToken = [];
    const results = await paginatedResults(ReferralReward, page, limit, {
        poolId: assetPool._id,
    });

    for (const r of results.results) {
        rewardToken.push(await ReferralReward.findOne({ rewardBaseId: r.id }));
    }

    results.results = rewardToken.map((r) => r.toJSON());

    return results;
}

export async function removeAllForPool(assetPool: AssetPoolDocument) {
    const rewards = await ReferralReward.find({ poolId: assetPool._id, variant: RewardVariant.RewardReferral });
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
    await ReferralReward.updateOne({ id: reward._id }, updates, { new: true });
    return ReferralReward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export default { get, findByPool, removeAllForPool, create, update };
