import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { RewardVariant } from '@thxnetwork/common/enums';
import RewardService from '@thxnetwork/api/services/RewardService';

const validation = [
    param('id').isMongoId(),
    param('rewardId').isMongoId(),
    param('variant').isString(),
    query('page').isInt(),
    query('limit').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const reward = await RewardService.findById(variant, req.params.rewardId);
    const entries = await RewardService.findPayments(reward.variant, {
        reward,
        page: Number(req.query.page),
        limit: Number(req.query.limit),
    });

    res.json(entries);
};

export default { controller, validation };
