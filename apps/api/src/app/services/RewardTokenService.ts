import db from '@thxnetwork/api/util/database';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { IRewardTokenUpdates, RewardToken, RewardTokenDocument } from '../models/RewardToken';
import { RewardVariant } from '../types/enums/RewardVariant';
import { createRewardBase, validateCondition, validateRewardBase } from './utils/rewards';
import WithdrawalService from './WithdrawalService';
import { RewardCondition } from '../types/RewardCondition';
import { RewardBase, RewardBaseDocument } from '../models/RewardBase';

export default class RewardTokenService {
    static async get(rewardId: string): Promise<RewardTokenDocument> {
        const reward = await RewardToken.findOne({ id: rewardId });
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
        // validate specific fields for rewardBase
        const rewardBase = (await reward.rewardBase) as RewardBaseDocument;
        const validationResult = await validateRewardBase(assetPool, rewardBase, account);
        if (validationResult.error) {
            return validationResult;
        }

        // Can only claim this reward once and a withdrawal already exists
        if (rewardBase.isClaimOnce) {
            const hasClaimedOnce = await WithdrawalService.hasClaimedOnce(
                String(assetPool._id),
                account.id,
                reward.rewardBaseId,
            );
            if (hasClaimedOnce) {
                return { error: 'You have already claimed this reward' };
            }
        }

        // Validate reward condition
        if (!reward.rewardConditionId) {
            return { result: true };
        }

        const rewardCondition = await RewardCondition.findById(reward.rewardConditionId);

        return await validateCondition(account, rewardCondition);
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
            withdrawAmount: number;
            amount: number;
            isClaimOnce: boolean;
        },
    ) {
        const rewardBase = await createRewardBase(assetPool, RewardVariant.RewardToken, data);
        return RewardToken.create({
            id: db.createUUID(),
            rewardBaseId: rewardBase.id,
            rewardConditionId: data.rewardConditionId,
            withdrawAmount: data.withdrawAmount,
        });
    }

    static async update(reward: RewardTokenDocument, updates: IRewardTokenUpdates) {
        await RewardBase.updateOne({ id: reward.rewardBaseId }, updates, { new: true });
        return RewardToken.findByIdAndUpdate(reward._id, updates, { new: true });
    }
}
