import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { MilestoneRewardDocument } from '../models/MilestoneReward';
import { v4 } from 'uuid';

export const MilestoneRewardClaimDocument = MilestoneRewardClaim;

export default {
    create: (data: { poolId: string; questId: string; walletId: string; amount: number }) => {
        return MilestoneRewardClaim.create({ uuid: v4(), isClaimed: false, ...data });
    },
    findByUUID: (uuid: string) => {
        return MilestoneRewardClaim.findOne({ uuid });
    },
    findByMilestoneReward: async (milestoneReward: MilestoneRewardDocument) => {
        return await MilestoneRewardClaim.find({ questId: milestoneReward._id });
    },
    findBySub: (milestoneReward: MilestoneRewardDocument, sub: string) => {
        return MilestoneRewardClaim.find({ questId: milestoneReward._id, sub });
    },
};
