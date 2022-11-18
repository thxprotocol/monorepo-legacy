import db from '@thxnetwork/api/util/database';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { RewardReferral, RewardReferralDocument } from '../models/RewardReferral';
import { RewardVariant } from '../types/enums/RewardVariant';
import { createRewardBase, validateRewardBase } from './utils/rewards';
import { IRewardBaseUpdates, RewardBase, RewardBaseDocument } from '../models/RewardBase';

export default class RewardService {
    static async get(rewardId: string): Promise<RewardReferralDocument> {
        const reward = await RewardReferral.findById(rewardId);
        if (!reward) return null;
        return reward;
    }

    static async findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
        const rewardToken = [];
        const results = await paginatedResults(RewardBase, page, limit, {
            poolId: assetPool._id,
            variant: RewardVariant.RewardReferral,
        });

        for (const r of results.results) {
            rewardToken.push(await RewardReferral.findOne({ rewardBaseId: r.id }));
        }

        results.results = rewardToken.map((r) => r.toJSON());

        return results;
    }

    static async canClaim(
        assetPool: AssetPoolDocument,
        reward: RewardReferralDocument,
        account: IAccount,
    ): Promise<{ result?: boolean; error?: string }> {
        // validate specific fields for rewardBase
        const validationResult = await validateRewardBase(
            assetPool,
            (await reward.rewardBase) as RewardBaseDocument,
            account,
        );

        return validationResult;
    }

    static async removeAllForPool(assetPool: AssetPoolDocument) {
        const rewards = await RewardBase.find({ poolId: assetPool._id, variant: RewardVariant.RewardReferral });
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
            amount: number;
            isClaimOnce: boolean;
        },
    ) {
        const rewardBase = await createRewardBase(assetPool, RewardVariant.RewardReferral, data);
        return RewardReferral.create({
            id: db.createUUID(),
            rewardBaseId: rewardBase.id,
        });
    }

    static update(reward: RewardReferralDocument, updates: IRewardBaseUpdates) {
        return RewardReferral.findByIdAndUpdate(reward.rewardBaseId, updates, { new: true });
    }
}
