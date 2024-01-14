import { Request, Response } from 'express';
import { param } from 'express-validator';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';

const validation = [param('id').isMongoId(), param('questId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const quest = await PointReward.findById(req.params.questId);
    const entries = await PointRewardService.findEntries(quest);
    res.json(entries);
};

export default { controller, validation };
