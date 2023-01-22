import { body } from 'express-validator';
import { Request, Response } from 'express';
import ReferralRewardService from '@thxnetwork/api/services/ReferralRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    body('title').exists().isString(),
    body('successUrl').optional().isURL({ require_tld: false }),
    body('amount').exists().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await ReferralRewardService.create(pool, req.body);
    res.status(201).json(reward);
};

export default { controller, validation };
