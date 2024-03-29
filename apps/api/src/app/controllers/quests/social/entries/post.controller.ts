import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { JobType, agenda } from '@thxnetwork/api/util/agenda';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import { TwitterUser } from '@thxnetwork/api/models/TwitterUser';
import { logger } from '@thxnetwork/api/util/logger';
import { questInteractionVariantMap } from '@thxnetwork/common/maps';
import { QuestSocial } from '@thxnetwork/api/models';

const validation = [param('id').isMongoId(), body('recaptcha').isString()];

const controller = async ({ params, body, account }: Request, res: Response) => {
    // Get the quest document
    const quest = await QuestSocial.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    // Get quest variant based on quest interaction variant
    const variant = questInteractionVariantMap[quest.interaction];

    // Get platform user id for account
    const platformUserId = QuestService.findUserIdForInteraction(account, quest.interaction);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    const data = { metadata: { platformUserId }, recaptcha: body.recaptcha };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isBotUser = await QuestService.isBotUser(quest.variant, { quest, account, data });
    if (!isBotUser) return res.json({ error: isBotUser.reason });

    // Get validation result for this quest entry
    const { result, reason } = await QuestService.getValidationResult(variant, { quest, account, data });
    if (!result) {
        // Reason includes part of the rate limit error so we log
        if (reason.includes('every 15 minutes')) {
            logger.info(`[${quest.poolId}][${account.sub}] X Quest ${quest._id} responds with rate limit error.`);
        }
        return res.json({ error: reason });
    }

    // Little exception here in order to store public metrics with the entry
    if (variant === QuestVariant.Twitter) {
        const user = await TwitterUser.findOne({ userId: platformUserId });
        data.metadata['publicMetrics'] = user.publicMetrics;
    }

    // Schedule serial job
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
