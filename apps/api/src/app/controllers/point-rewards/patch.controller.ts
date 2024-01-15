import { questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import QuestSocialCreate from './post.controller';

const validation = [param('id').exists(), ...QuestSocialCreate.validation];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Quest Social']
    const {
        title,
        description,
        amount,
        infoLinks,
        limit,
        index,
        isPublished,
        platform,
        interaction,
        content,
        contentMetadata,
        expiryDate,
        locks,
    } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const variant = questInteractionVariantMap[interaction];
    const quest = await QuestService.update(variant, req.params.id, {
        title,
        description,
        amount,
        infoLinks,
        limit,
        index,
        isPublished,
        platform,
        interaction,
        content,
        contentMetadata,
        image,
        expiryDate,
        locks,
    });

    res.json(quest);
};

export default { controller, validation };
