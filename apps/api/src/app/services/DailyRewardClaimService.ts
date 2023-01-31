import { DailyRewardClaim } from '@thxnetwork/api/models/DailyRewardClaims';
import db from '@thxnetwork/api/util/database';
import { DailyRewardDocument } from '../models/DailyReward';

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
    findBySub: (dailyReward: DailyRewardDocument, sub: string) => {
        return DailyRewardClaim.find({ dailyRewardId: dailyReward._id, sub });
    },
};
