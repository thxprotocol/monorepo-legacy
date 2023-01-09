import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import db from '@thxnetwork/api/util/database';
import { TReferralRewardClaim } from '@thxnetwork/types/interfaces/ReferralRewardClaim';

import { ReferralRewardDocument } from '../models/ReferralReward';
import { paginatedResults } from '../util/pagination';
import { ReferralRewardClaimDocument } from '../models/ReferralRewardClaim';

export default {
    create: async (data: { referralRewardId: string; sub: string }) => {
        return await ReferralRewardClaim.create({ uuid: db.createUUID(), ...data, isApproved: false });
    },
    update: async (claim: ReferralRewardClaimDocument, updates: TReferralRewardClaim) => {
        return await ReferralRewardClaim.findByIdAndUpdate(claim._id, updates, { new: true });
    },
    findByUUID: async (uuid: string) => {
        return await ReferralRewardClaim.findOne({ uuid });
    },
    findByReferralReward: async (referralReward: ReferralRewardDocument) => {
        return await ReferralRewardClaim.find({ referralRewardId: referralReward._id });
    },
    findByReferralRewardPaginated: async (referralReward: ReferralRewardDocument, page: number, limit: number) => {
        const result = await paginatedResults(ReferralRewardClaim, page, limit, {
            referralRewardId: referralReward._id,
        });
        return result;
    },
    findBySub: async (referralReward: ReferralRewardDocument, sub: string) => {
        return await ReferralRewardClaim.find({ referralRewardId: referralReward._id, sub });
    },
};
