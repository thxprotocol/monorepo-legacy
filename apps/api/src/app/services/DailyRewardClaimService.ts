import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';
import { ONE_DAY_MS } from '../util/dates';
import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
export const DailyRewardClaimDocument = DailyRewardClaim;

export default {
    create: (data: {
        dailyRewardId: string;
        sub: string;
        amount?: number;
        poolId: string;
        state?: DailyRewardClaimState;
    }) => {
        return DailyRewardClaim.create({ uuid: db.createUUID(), ...data });
    },
    findByUUID: (uuid: string) => {
        return DailyRewardClaim.findOne({ uuid });
    },
    findByDailyReward: async (dailyReward: DailyRewardDocument) => {
        return await DailyRewardClaim.find({ dailyRewardId: dailyReward._id });
    },
    findBySub: async (dailyReward: DailyRewardDocument, sub: string) => {
        return await DailyRewardClaim.find({
            dailyRewardId: dailyReward._id,
            sub,
            state: DailyRewardClaimState.Claimed,
        });
    },
    isClaimable: async (dailyReward: DailyRewardDocument, sub: string) => {
        const claim = await DailyRewardClaim.findOne({
            sub,
            poolId: dailyReward.poolId,
            dailyRewardId: dailyReward._id,
            createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
        });
        if (!dailyReward.isEnabledWebhookQualification) return !claim;

        // If webhook qualification is enabled and we have found a claim this means
        // the claim could still be claimed, else if a claim is found the claim could
        // no longer be claimed.
        return claim && claim.state === DailyRewardClaimState.Pending ? true : false;
    },
};
