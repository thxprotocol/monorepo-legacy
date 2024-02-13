import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('id').isMongoId(),
    param('questId').isMongoId(),
    param('variant').isString(),
    query('page').isInt(),
    query('limit').isInt(),
];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const quest = await QuestService.findById(variant, req.params.questId);
    const entries = await QuestService.findEntries(quest.variant, {
        quest,
        page: Number(req.query.page),
        limit: Number(req.query.limit),
    });

    res.json(entries);
};

export default { controller, validation };
