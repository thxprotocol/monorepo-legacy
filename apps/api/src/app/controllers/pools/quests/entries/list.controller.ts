import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';

const validation = [
    param('id').isMongoId(),
    param('questId').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const quest = await PointReward.findById(req.params.questId);
    const entries = await PointRewardService.findEntries(quest, Number(req.query.page), Number(req.query.limit));

    res.json(entries);
};

export default { controller, validation };
