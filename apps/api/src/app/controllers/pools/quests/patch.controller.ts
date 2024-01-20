import { param } from 'express-validator';
import { Request, Response } from 'express';
import QuestService from '@thxnetwork/api/services/QuestService';
import ImageService from '@thxnetwork/api/services/ImageService';
import CreateController from './post.controller';

const validation = [param('id').isMongoId(), param('questId').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.update(req.body.variant, req.params.questId, { ...req.body, image });

    res.json(quest);
};

export default { controller, validation };
