import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { MilestoneRewardDocument } from '../models/MilestoneReward';
import { v4 } from 'uuid';

export const MilestoneRewardClaimDocument = MilestoneRewardClaim;

export default {
    create: (data: { poolId: string; milestoneRewardId: string; walletId: string; amount: number }) => {
        return MilestoneRewardClaim.create({ uuid: v4(), isClaimed: false, ...data });
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
