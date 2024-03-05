import { param } from 'express-validator';
import { Request, Response } from 'express';
import { QuestVariant } from '@thxnetwork/common/enums';
import QuestService from '@thxnetwork/api/services/QuestService';
import CreateController from '@thxnetwork/api/controllers/pools/quests/post.controller';

const validation = [param('variant').isInt(), param('questId').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const questId = req.params.questId as string;

    let quest = await QuestService.findById(variant, questId);
    quest = await QuestService.update(quest, req.body, req.file);

    res.json(quest);
};

export default { controller, validation };
