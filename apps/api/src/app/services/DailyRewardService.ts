import { DailyReward as DailyRewardDocument } from '@thxnetwork/api/models/DailyReward';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '../util/pagination';
import { TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import { DailyRewardClaimDocument } from '../models/DailyRewardClaims';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(DailyReward, page, limit, { poolId: pool._id });
}

export function findByUUID(uuid: string) {
    return DailyReward.findOne({ uuid });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TDailyReward>) {
    return await DailyReward.create({
        poolId: pool._id,
        ...payload,
    });
}

async function getPointsAvailable(quest: TDailyReward, validClaims: DailyRewardClaimDocument[]) {
    const amountIndex =
        validClaims.length >= quest.amounts.length ? validClaims.length % quest.amounts.length : validClaims.length;
    return quest.amounts[amountIndex];
}

export const DailyReward = DailyRewardDocument;

export default { findByPool, findByUUID, create, getPointsAvailable };
