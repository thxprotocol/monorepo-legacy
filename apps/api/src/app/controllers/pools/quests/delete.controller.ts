import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { questMap } from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId(), body('variant').isInt()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const questId = req.params.questId;
    const ModelQuest = questMap[req.body.variant].models.quest;
    await ModelQuest.findByIdAndRemove(questId);

    res.status(204).end();
};

export default { controller, validation };
