import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { Request, Response } from 'express';
import { body } from 'express-validator';

const validation = [
    body('title').isString(),
    body('description').isString(),
    body('amount').isString(),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    let rewardConditionId: string;

    // if (req.body.platform && req.body.interaction && req.body.content) {
    //     const rewardCondition = await RewardCondition.create({
    //         platform: req.body.platform,
    //         interaction: req.body.interaction,
    //         content: req.body.content,
    //     });
    //     rewardConditionId = String(rewardCondition._id);
    // }

    const pointReward = await PointReward.create({
        poolId: req.assetPool._id,
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
        rewardConditionId,
    });
    res.status(201).json(pointReward);
};

export default { validation, controller };
