import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import ImageService from '@thxnetwork/api/services/ImageService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, check, param } from 'express-validator';

const validation = [
    param('id').isMongoId(),
    body('index').optional().isInt(),
    body('title').optional().isString(),
    body('isPublished').optional().isBoolean(),
    body('description').optional().isString(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('amount').optional().isInt({ gt: 0 }),
    body('limit').optional().isInt(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Milestone Rewards']
    const { title, description, amount, infoLinks, limit, index, isPublished } = req.body;
    const image = req.file && (await ImageService.upload(req.file));
    const reward = await MilestoneReward.findByIdAndUpdate(
        req.params.id,
        {
            title,
            description,
            image,
            amount,
            infoLinks,
            index,
            limit,
            isPublished,
        },
        { new: true },
    );

    PoolService.sendNotification(reward);

    res.status(201).json(reward);
};

export default { controller, validation };
