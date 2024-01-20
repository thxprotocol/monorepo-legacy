import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';

const validation = [
    param('id').exists(),
    body('isApproved').optional().isBoolean(),
    body('sub').optional().isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    let claim = await ReferralRewardClaimService.findByUUID(req.params.id);
    if (!claim) throw new NotFoundError('Could not find the reward claim for this id');
    claim = await ReferralRewardClaim.findByIdAndUpdate(claim._id, req.body, { new: true });
    return res.json(claim);
};

export default { controller, validation };