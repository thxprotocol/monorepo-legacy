import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ImageService from '@thxnetwork/api/services/ImageService';
import QuestService from '@thxnetwork/api/services/QuestService';
import CreateQuestDaily from './post.controller';

const validation = [param('id').exists(), ...CreateQuestDaily.validation];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Rewards']
    let quest = await DailyReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find the dailyReward');

    const image = req.file && (await ImageService.upload(req.file));
    const { title, description, amounts, infoLinks, eventName, index, isPublished, locks, expiryDate } = req.body;

    quest = await QuestService.update(QuestVariant.Daily, req.params.id, {
        title,
        description,
        amounts,
        image,
        infoLinks,
        eventName,
        index,
        isPublished,
        expiryDate,
        locks,
    });

    return res.json(quest);
};

export default { controller, validation };
