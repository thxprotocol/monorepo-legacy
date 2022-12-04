import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import db from '@thxnetwork/api/util/database';
import { ReferralRewardDocument } from '../models/ReferralReward';

export const ReferralRewardClaimDocument = ReferralRewardClaim;

export default {
    create: (data: { referralRewardId: string; sub: string }) => {
        return ReferralRewardClaim.create({ uuid: db.createUUID(), ...data });
    },
    findByUUID: (uuid: string) => {
        return ReferralRewardClaim.findOne({ uuid });
    },
    findByReferralReward: async (referralReward: ReferralRewardDocument) => {
        return await ReferralRewardClaim.find({ referralRewardId: referralReward._id });
    },
    findBySub: (referralReward: ReferralRewardDocument, sub: string) => {
        return ReferralRewardClaim.find({ referralRewardId: referralReward._id, sub });
    },
};
