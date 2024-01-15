import { DailyRewardDocument, DailyReward } from '@thxnetwork/api/models/DailyReward';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '../util/pagination';
import { TDailyReward } from '@thxnetwork/types/interfaces/DailyReward';
import { DailyRewardClaimDocument } from '../models/DailyRewardClaims';
import { WalletDocument } from '../models/Wallet';
import DailyRewardClaimService, { ONE_DAY_MS } from './DailyRewardClaimService';

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

async function findOne(quest: DailyRewardDocument, wallet?: WalletDocument) {
    const validationResult = wallet ? await DailyRewardClaimService.validate(quest, wallet) : { result: true };
    const validClaims = wallet ? await DailyRewardClaimService.findByWallet(quest, wallet) : [];
    const claimAgainTime = validClaims.length ? new Date(validClaims[0].createdAt).getTime() + ONE_DAY_MS : null;
    const now = Date.now();
    const pointsAvailable = await getPointsAvailable(quest, validClaims);

    return {
        ...quest.toJSON(),
        pointsAvailable,
        isDisabled: !validationResult.result,
        claims: validClaims,
        claimAgainDuration:
            claimAgainTime && claimAgainTime - now > 0 ? Math.floor((claimAgainTime - now) / 1000) : null, // Convert and floor to S,
    };
}

async function getPointsAvailable(quest: TDailyReward, validClaims: DailyRewardClaimDocument[]) {
    const amountIndex =
        validClaims.length >= quest.amounts.length ? validClaims.length % quest.amounts.length : validClaims.length;
    return quest.amounts[amountIndex];
}

export { DailyReward };
export default { findOne, findByPool, findByUUID, create, getPointsAvailable };
