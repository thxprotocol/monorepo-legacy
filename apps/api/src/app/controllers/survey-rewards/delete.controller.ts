import SurveyRewardService from '@thxnetwork/api/services/SurveyRewardService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Survey Rewards']
    await SurveyRewardService.remove(String(req.params.id));
    res.status(204).end();
};

export default { validation, controller };
