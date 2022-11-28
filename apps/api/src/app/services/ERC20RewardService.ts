import db from '@thxnetwork/api/util/database';
import type { IAccount } from '@thxnetwork/api/models/Account';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ERC20Reward, ERC20RewardDocument } from '../models/ERC20Reward';
import { validateCondition } from '../util/condition';
import { RewardConditionPlatform, TERC20Reward } from '@thxnetwork/types/index';
import { Claim } from '../models/Claim';

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

export async function canClaim(
    assetPool: AssetPoolDocument,
    reward: TERC20Reward,
    account: IAccount,
): Promise<{ result?: boolean; error?: string }> {
    if (reward.expiryDate) {
        const expiryTimestamp = new Date(reward.expiryDate).getTime();
        if (Date.now() > expiryTimestamp) return { error: 'This reward claim has expired.' };
    }

    // Can only claim this reward once and a withdrawal already exists
    if (reward.isClaimOnce) {
        const hasClaimedOnce = await Claim.exists({ sub: account.id });
        if (hasClaimedOnce) {
            return { error: 'You have already claimed this reward' };
        }
    }

    // Can only claim this reward once and a withdrawal already exists
    if (reward.rewardLimit > 0) {
        const amountOfClaims = await Claim.countDocuments({ rewardId: String(reward._id) });
        if (amountOfClaims > reward.rewardLimit) {
            return { error: 'You have already claimed this reward' };
        }
    }

    // Validate reward condition
    if (reward.platform === RewardConditionPlatform.None) {
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
    console.log(payload);
    return await ERC20Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC20RewardDocument, payload: TERC20Reward) {
    return await ERC20Reward.findByIdAndUpdate(reward._id, payload, { new: true });
}

export default { get, findByPool, canClaim, removeAllForPool, create, update };
