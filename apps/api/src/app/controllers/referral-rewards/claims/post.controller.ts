import { Request, Response } from 'express';
import { body } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';

const validation = [body('sub').exists().isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const claim = await ReferralRewardClaimService.create({
        sub: req.body.sub,
        referralRewardId: req.params.uuid,
        isApproved: false,
    });
    return res.status(201).json(claim);
};

export default { controller, validation };
