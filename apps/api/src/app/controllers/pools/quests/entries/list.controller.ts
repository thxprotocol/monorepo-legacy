import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('id').isMongoId(),
    param('variant').isString(),
    param('questId').isMongoId(),
    query('page').isInt(),
    query('limit').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const questId = req.params.questId as string;
    const quest = await QuestService.findById(variant, questId);
    const entries = await QuestService.findEntries(quest, {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
    });

    res.json(entries);
};

export default { controller, validation };
