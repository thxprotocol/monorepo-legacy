import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import CreateQuestCustom from './post.controller';

const validation = [param('id').isMongoId(), ...CreateQuestCustom.validation];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const { title, description, amount, infoLinks, limit, index, isPublished, expiryDate, eventName, locks } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.update(QuestVariant.Custom, req.params.id, {
        title,
        description,
        image,
        amount,
        infoLinks,
        index,
        limit,
        eventName,
        isPublished,
        expiryDate,
        locks,
    });

    res.status(201).json(quest);
};

export default { controller, validation };
