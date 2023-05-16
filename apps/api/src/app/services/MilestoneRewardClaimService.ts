import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import db from '@thxnetwork/api/util/database';
import { MilestoneRewardDocument } from '../models/MilestoneReward';

export const MilestoneRewardClaimDocument = MilestoneRewardClaim;

export default {
    create: (data: { poolId: string; milestoneRewardId: string; walletId: string; amount: string }) => {
        return MilestoneRewardClaim.create({ uuid: db.createUUID(), isClaimed: false, ...data });
    },
    findByUUID: (uuid: string) => {
        return MilestoneRewardClaim.findOne({ uuid });
    },
    findByMilestoneReward: async (milestoneReward: MilestoneRewardDocument) => {
        return await MilestoneRewardClaim.find({ milestoneRewardId: milestoneReward._id });
    },
    findBySub: (milestoneReward: MilestoneRewardDocument, sub: string) => {
        return MilestoneRewardClaim.find({ milestoneRewardId: milestoneReward._id, sub });
    },
};
