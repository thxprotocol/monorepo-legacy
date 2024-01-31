import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults, PaginationResult } from '@thxnetwork/api/util/pagination';
import { ReferralReward, ReferralRewardDocument } from '@thxnetwork/api/models/ReferralReward';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';
import { WalletDocument } from '../models/Wallet';

async function findByPool(assetPool: AssetPoolDocument, page: number, limit: number): Promise<PaginationResult> {
    const result = await paginatedResults(ReferralReward, page, limit, {
        poolId: assetPool._id,
    });
    result.results = result.results.map((r) => r.toJSON());
    return result;
}

async function removeAllForPool(pool: AssetPoolDocument) {
    await ReferralReward.deleteMany({ poolId: pool._id });
}

async function remove(reward: ReferralRewardDocument) {
    const deleteResult = ReferralReward.findOneAndDelete(reward._id);
    await ReferralRewardClaim.deleteMany({ referralRewardId: reward._id });
    return deleteResult;
}

async function findOne(quest: ReferralRewardDocument, wallet?: WalletDocument) {
    return {
        ...quest.toJSON(),
        amount: quest.amount,
        pointsAvailable: quest.amount,
        pathname: quest.pathname,
        successUrl: quest.successUrl,
    };
}

function getAmount(quest: ReferralRewardDocument) {
    return quest.amount;
}

function getValidationResult(quest, account, wallet) {
    return {
        result: false,
        reason: 'Sorry, support not yet implemented...',
    };
}

function isAvailable() {
    return true;
}

export default {
    findOne,
    findByPool,
    removeAllForPool,
    remove,
    getAmount,
    getValidationResult,
    isAvailable,
};
