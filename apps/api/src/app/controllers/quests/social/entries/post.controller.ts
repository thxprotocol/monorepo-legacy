import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { param } from 'express-validator';
import { JobType, questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getPlatformUserId } from '@thxnetwork/api/services/QuestSocialService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // Get the quest document
    const quest = await PointReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Quest not found.');

    // Get quest variant for quest interaction variant
    const variant = questInteractionVariantMap[quest.interaction];

    // Get platform user id for account
    const platformUserId = await getPlatformUserId(req.account, quest.platform);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    // Get validation result for this quest entry
    const { result, reason } = await QuestService.getValidationResult(variant, quest, req.account, req.wallet, {
        platformUserId,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant,
        questId: quest._id,
        sub: req.account.sub,
        data: { platformUserId },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
