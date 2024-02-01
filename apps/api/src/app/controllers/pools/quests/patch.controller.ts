import { param } from 'express-validator';
import { Request, Response } from 'express';
import QuestService from '@thxnetwork/api/services/QuestService';
import CreateController from '@thxnetwork/api/controllers/pools/quests/post.controller';

const validation = [param('questId').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    console.log(req.body);
    const quest = await QuestService.update(req.body.variant, req.params.questId, req.body, req.file);
    res.json(quest);
};

export default { controller, validation };
