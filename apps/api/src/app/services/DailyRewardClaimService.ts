import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';
import { ONE_DAY_MS } from '../util/dates';
export const DailyRewardClaimDocument = DailyRewardClaim;

export default {
    create: (data: { dailyRewardId: string; sub: string; amount?: string; poolId: string }) => {
        return DailyRewardClaim.create({ uuid: db.createUUID(), ...data });
    },
    findByUUID: (uuid: string) => {
        return DailyRewardClaim.findOne({ uuid });
    },
    findByDailyReward: async (dailyReward: DailyRewardDocument) => {
        return await DailyRewardClaim.find({ dailyRewardId: dailyReward._id });
    },
    findBySub: async (dailyReward: DailyRewardDocument, sub: string) => {
        return await DailyRewardClaim.find({ dailyRewardId: dailyReward._id, sub });
    },
    isClaimed: async (poolId: string, sub: string) => {
        const isClaimedWithinTimeframe = !!(await DailyRewardClaim.exists({
            poolId,
            sub,
            createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
        }));
        return isClaimedWithinTimeframe;
    },
};
