import db from '@thxnetwork/api/util/database';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { RewardToken, RewardTokenDocument } from '../models/RewardToken';
import { IRewardBaseUpdates, RewardBase, RewardBaseDocument } from '../types/RewardBase';
import { RewardVariant } from '../types/enums/RewardVariant';
import { canClaim } from './utils/rewards';
import { RewardState } from '../types/enums/RewardState';

export default class RewardService {
    static async get(rewardId: string): Promise<RewardTokenDocument> {
        const reward = await RewardToken.findById(rewardId);
        if (!reward) return null;
        return reward;
    }

    static async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const rewardToken = [];
        const results = await paginatedResults(RewardBase, page, limit, {
            poolId: assetPool._id,
            variant: RewardVariant.RewardToken,
        });

        for (const r of results.results) {
            rewardToken.push(await RewardToken.findOne({ rewardBaseId: r.id }));
        }

        results.results = rewardToken.map((r) => r.toJSON());

        return results;
    }

    static async canClaim(
        assetPool: AssetPoolDocument,
        reward: RewardTokenDocument,
        account: IAccount,
    ): Promise<{ result?: boolean; error?: string }> {
        return canClaim(assetPool, reward.rewardBase as RewardBaseDocument, account);
    }

    static async removeAllForPool(assetPool: AssetPoolDocument) {
        const rewards = await RewardBase.find({ poolId: assetPool._id, variant: RewardVariant.RewardToken });
        for (const r of rewards) {
            await r.remove();
        }
    }

    static async create(
        assetPool: AssetPoolDocument,
        data: {
            title: string;
            slug: string;
            limit: number;
            expiryDate: Date;
            rewardConditionId?: string;
            amount: number;
        },
    ) {
        const expiryDateObj = data.expiryDate && new Date(data.expiryDate);
        const rewardBase = await RewardBase.create({
            id: db.createUUID(),
            title: data.title,
            slug: data.slug,
            variant: RewardVariant.RewardToken,
            poolId: assetPool._id,
            limit: data.limit,
            expiryDate: expiryDateObj,
            state: RewardState.Enabled,
            amount: data.amount,
        });
        return RewardToken.create({
            id: db.createUUID(),
            rewardBaseId: rewardBase.id,
            rewardConditionId: data.rewardConditionId,
        });
    }

    static update(reward: RewardTokenDocument, updates: IRewardBaseUpdates) {
        return RewardToken.findByIdAndUpdate(reward.rewardBaseId, updates, { new: true });
    }
}
