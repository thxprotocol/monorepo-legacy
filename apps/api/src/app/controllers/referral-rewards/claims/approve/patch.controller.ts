import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { ReferralRewardClaimDocument } from '@thxnetwork/api/models/ReferralRewardClaim';

const validation = [body('claimUuids').exists().isArray()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const claims: ReferralRewardClaimDocument[] = [];
    const promises = req.body.claimUuids.map(async (uuid: string) => {
        let claim = await ReferralRewardClaimService.findByUUID(uuid);
        if (!claim) throw new NotFoundError('Could not find the reward claim for this id');
        if (!claim.isApproved) {
            claim.isApproved = true;
            claim = await ReferralRewardClaimService.update(claim, claim);
        }
        claims.push(claim);
    });
    await Promise.all(promises);
    return res.json(claims);
};

export default { controller, validation };
