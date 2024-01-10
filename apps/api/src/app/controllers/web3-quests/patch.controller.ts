import { Request, Response } from 'express';
import { param } from 'express-validator';
import { QuestVariant } from '@thxnetwork/types/enums';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import QuestWeb3Create from './post.controller';

const validation = [param('id').optional().isMongoId(), ...QuestWeb3Create.validation];

const controller = async (req: Request, res: Response) => {
    const image = req.file && (await ImageService.upload(req.file));
    const quest = await QuestService.update(QuestVariant.Web3, req.params.id, { ...req.body, image });

    res.status(201).json(quest);
};

export default { controller, validation };
