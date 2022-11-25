import db from '@thxnetwork/api/util/database';
import WithdrawalService from './WithdrawalService';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ERC20Reward, ERC20RewardDocument } from '../models/ERC20Reward';
import { validateCondition } from '../util/condition';
import { TERC20Reward } from '@thxnetwork/types/';

export async function get(rewardId: string): Promise<ERC20RewardDocument> {
    const reward = await ERC20Reward.findOne({ id: rewardId });
    if (!reward) return null;
    return reward;
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number) {
    const result = await paginatedResults(ERC20Reward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function canClaim(
    assetPool: AssetPoolDocument,
    reward: TERC20Reward,
    account: IAccount,
): Promise<{ result?: boolean; error?: string }> {
    if (reward.rewardLimit > 0) {
        const withdrawals = await WithdrawalService.findByQuery({
            poolId: String(assetPool._id),
            rewardId: reward._id,
        });
        if (withdrawals.length >= reward.rewardLimit) {
            return { error: 'This reward is reached it limit' };
        }
    }

    if (reward.expiryDate) {
        const expiryTimestamp = new Date(reward.expiryDate).getTime();
        if (Date.now() > expiryTimestamp) return { error: 'This reward URL has expired' };
    }

    // Can only claim this reward once and a withdrawal already exists
    if (reward.isClaimOnce) {
        const hasClaimedOnce = await WithdrawalService.hasClaimedOnce(String(assetPool._id), account.id, reward._id);
        if (hasClaimedOnce) {
            return { error: 'You have already claimed this reward' };
        }
    }

    // Validate reward condition
    if (!reward.isConditional) {
        return { result: true };
    }

    return await validateCondition(account, reward);
}

export async function removeAllForPool(assetPool: AssetPoolDocument) {
    const rewards = await ERC20Reward.find({ poolId: assetPool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC20Reward) {
    return ERC20Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC20RewardDocument, updates: unknown) {
    await ERC20Reward.updateOne({ _id: reward._id }, updates, { new: true });
    return ERC20Reward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export default { get, findByPool, canClaim, removeAllForPool, create, update };
