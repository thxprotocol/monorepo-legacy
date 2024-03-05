import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Pool } from '@thxnetwork/api/models';
import { JobType, agenda } from '@thxnetwork/api/util/agenda';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [
    param('id').exists(),
    body('settings.title').optional().isString().trim().escape().isLength({ max: 50 }),
    body('settings.slug').optional().isString().trim().escape().isLength({ min: 3, max: 25 }),
    body('settings.description').optional().isString().trim().escape().isLength({ max: 255 }),
    body('settings.startDate').optional({ nullable: true }).isString(),
    body('settings.endDate').optional({ nullable: true }).isString(),
    body('settings.discordWebhookUrl').optional({ checkFalsy: true }).isURL(),
    body('settings.isArchived').optional().isBoolean(),
    body('settings.isPublished').optional().isBoolean(),
    body('settings.isWeeklyDigestEnabled').optional().isBoolean(),
    body('settings.isTwitterSyncEnabled').optional().isBoolean(),
    body('settings.defaults.conditionalRewards.title').optional().isString(),
    body('settings.defaults.conditionalRewards.description').optional().isString(),
    body('settings.defaults.conditionalRewards.amount').optional().isInt(),
    body('settings.defaults.conditionalRewards.hashtag').optional().isString(),
    body('settings.defaults.conditionalRewards.isPublished').optional().isBoolean(),
    body('settings.authenticationMethods').optional().isArray(),
];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Could not find the Asset Pool for this id');

    const { settings } = req.body;
    const isSlugUsed = !!(await Pool.exists({
        '_id': { $ne: pool._id },
        'settings.slug': settings.slug,
    }));
    if (settings && settings.slug && isSlugUsed) {
        throw new BadRequestError('This slug is in use already.');
    }

    const result = await Pool.findByIdAndUpdate(
        pool._id,
        { settings: Object.assign(pool.settings, req.body.settings) },
        { new: true },
    );

    if (settings.isPublished && settings.isPublished !== pool.settings.isPublished) {
        await agenda.now(JobType.UpdateCampaignRanks);
    }

    return res.json(result);
};
export default { controller, validation };
