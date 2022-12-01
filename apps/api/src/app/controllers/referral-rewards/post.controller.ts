import { body } from 'express-validator';
import { Request, Response } from 'express';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';

const validation = [
    body('title').exists().isString(),
    body('successUrl').exists().isURL(),
    body('amount').exists().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const reward = await ReferralRewardService.create(req.assetPool, req.body);
    res.status(201).json(reward.toJSON());
};

export default { controller, validation };
