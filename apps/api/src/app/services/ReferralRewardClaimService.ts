import { ReferralRewardClaim as ReferralRewardClaimModel } from '@thxnetwork/api/models/ReferralRewardClaim';
import db from '@thxnetwork/api/util/database';
import { TReferralRewardClaim } from '@thxnetwork/types/interfaces/ReferralRewardClaim';

import { ReferralRewardDocument } from '../models/ReferralReward';
import { paginatedResults } from '../util/pagination';
import { ReferralRewardClaimDocument } from '../models/ReferralRewardClaim';

async function create(data: { referralRewardId: string; sub: string; isApproved: boolean }) {
    return await ReferralRewardClaimModel.create({ uuid: db.createUUID(), ...data });
}

async function update(claim: ReferralRewardClaimDocument, updates: TReferralRewardClaim) {
    return await ReferralRewardClaimModel.findByIdAndUpdate(claim._id, updates, { new: true });
}
async function findByUUID(uuid: string) {
    return await ReferralRewardClaimModel.findOne({ uuid });
}
async function findByReferralReward(referralReward: ReferralRewardDocument) {
    return await ReferralRewardClaimModel.find({ referralRewardId: referralReward._id });
}
async function findByReferralRewardPaginated(referralReward: ReferralRewardDocument, page: number, limit: number) {
    const result = await paginatedResults(ReferralRewardClaimModel, page, limit, {
        referralRewardId: referralReward._id,
    });
    return result;
}
async function findBySub(referralReward: ReferralRewardDocument, sub: string) {
    return await ReferralRewardClaimModel.find({ referralRewardId: referralReward._id, sub });
}

export default {
    create,
    update,
    findByUUID,
    findByReferralReward,
    findByReferralRewardPaginated,
    findBySub,
};
