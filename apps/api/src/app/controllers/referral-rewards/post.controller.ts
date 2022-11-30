import { body } from 'express-validator';
import { Request, Response } from 'express';
import { createReferralReward } from '@thxnetwork/api/util/rewards';

const validation = [
    body('title').exists().isString(),
    body('successUrl').exists().isURL(),
    body('amount').exists().isInt({ gt: 0 }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsReferral']
    const { reward, claims } = await createReferralReward(req.assetPool, req.body);
    res.status(201).json({ ...reward.toJSON(), claims });
};

export default { controller, validation };
