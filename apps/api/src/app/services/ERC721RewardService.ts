import db from '@thxnetwork/api/util/database';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { IAccount } from '@thxnetwork/api/models/Account';
import { validateCondition } from '@thxnetwork/api/util/condition';
import { RewardConditionPlatform, TERC721Reward } from '@thxnetwork/types/index';
import { ERC721Reward, ERC721RewardDocument } from '@thxnetwork/api/models/ERC721Reward';
import { Claim } from '@thxnetwork/api/models/Claim';

export async function get(id: string): Promise<ERC721RewardDocument> {
    return await ERC721Reward.findById(id);
}

export async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ERC721Reward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

export async function canClaim(
    reward: TERC721Reward,
    account: IAccount,
): Promise<{ result?: boolean; error?: string }> {
    if (reward.expiryDate) {
        const expiryTimestamp = new Date(reward.expiryDate).getTime();
        if (Date.now() > expiryTimestamp) {
            return { error: 'This reward claim has expired.' };
        }
    }

    // Can only claim this reward once and a withdrawal already exists
    if (reward.rewardLimit > 0) {
        const amountOfClaims = await Claim.countDocuments({ rewardId: String(reward._id), sub: { $exists: true } });
        if (amountOfClaims >= reward.rewardLimit) {
            return { error: "This reward has reached it's limit" };
        }
    }

    // Can only claim this reward once and a withdrawal already exists
    const hasClaimedOnce = await Claim.exists({ rewardId: String(reward._id), sub: account.id });
    if (hasClaimedOnce) {
        return { error: 'You can only claim this reward once.' };
    }

    // If not platform skip condition validation
    if (reward.platform === RewardConditionPlatform.None) {
        return { result: true };
    }

    // Validate reward condition
    return await validateCondition(account, reward);
}

export async function removeAllForPool(pool: AssetPoolDocument) {
    const rewards = await ERC721Reward.find({ poolId: pool._id });
    for (const r of rewards) {
        await r.remove();
    }
}

export async function create(pool: AssetPoolDocument, payload: TERC721Reward) {
    return await ERC721Reward.create({
        poolId: String(pool._id),
        uuid: db.createUUID(),
        ...payload,
    });
}

export async function update(reward: ERC721RewardDocument, updates: TERC721Reward) {
    return await ERC721Reward.findByIdAndUpdate(reward._id, updates, { new: true });
}

export default { get, canClaim, findByPool, removeAllForPool, create, update };
