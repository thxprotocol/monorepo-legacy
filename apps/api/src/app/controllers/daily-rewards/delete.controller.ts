import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']
    await DailyReward.deleteOne({ _id: req.params.id });
    res.status(204).end();
};

export default { validation, controller };
