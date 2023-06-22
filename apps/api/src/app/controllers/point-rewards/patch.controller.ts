import { PointReward } from '@thxnetwork/api/services/PointRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { isValidUrl } from '@thxnetwork/api/util/url';
import { TInfoLink } from '@thxnetwork/types/interfaces';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').exists(),
    body('title').isString(),
    body('description').isString(),
    body('amount').isInt({ gt: 0 }),
    body('platform').isNumeric(),
    body('interaction').optional().isNumeric(),
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
    reward = await PointReward.findByIdAndUpdate(reward._id, {
        title: req.body.title,
        description: req.body.description,
        amount: req.body.amount,
        platform: req.body.platform,
        infoLinks: req.body.infoLinks,
        interaction: req.body.interaction,
        content: req.body.content,
        contentMetadata: req.body.contentMetadata,
    });

    return res.json(reward);
};

export default { controller, validation };
