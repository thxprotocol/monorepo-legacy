import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { RewardVariant } from '@thxnetwork/common/enums';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import RewardService from '@thxnetwork/api/services/RewardService';

const validation = [
    param('id').isMongoId(),
    param('variant').isString(),
    param('rewardId').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
    query('query').isString(),
];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const reward = await RewardService.findById(variant, req.params.rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const payments = await RewardService.findPayments(reward, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        query: req.query.query as string,
    });

    res.json(payments);
};

export default { controller, validation };
