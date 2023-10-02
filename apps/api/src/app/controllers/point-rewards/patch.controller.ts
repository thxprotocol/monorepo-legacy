import ImageService from '@thxnetwork/api/services/ImageService';
import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param, check } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('isPublished').optional().isBoolean(),
    body('amount').optional().isInt({ gt: 0 }),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    body('platform').optional().isNumeric(),
    body('interaction').optional().isNumeric(),
    body('index').optional().isInt(),
    body('content').optional().isString(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
    body('infoLinks')
        .optional()
        .customSanitizer((infoLinks) => {
            return JSON.parse(infoLinks).filter((link: TInfoLink) => link.label.length && isValidUrl(link.url));
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    let reward = await PointReward.findById(req.params.id);
    if (!reward) throw new NotFoundError('Could not find the reward');
    const image = req.file && (await ImageService.upload(req.file));
    const {
        title,
        description,
        amount,
        platform,
        infoLinks,
        interaction,
        content,
        contentMetadata,
        index,
        isPublished,
    } = req.body;
    reward = await PointReward.findByIdAndUpdate(
        reward._id,
        {
            title,
            description,
            amount,
            image,
            platform,
            infoLinks,
            interaction,
            content,
            contentMetadata,
            index,
            isPublished,
        },
        { new: true },
    );

    PoolService.sendNotification(reward);

    return res.json(reward);
};

export default { controller, validation };
