import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { param } from 'express-validator';
import { JobType, questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import QuestService from '@thxnetwork/api/services/QuestService';
import { QuestVariant } from '@thxnetwork/sdk/types/enums';
import { TwitterUser } from '@thxnetwork/api/models/TwitterUser';

const validation = [param('id').isMongoId()];

const controller = async ({ params, account, wallet }: Request, res: Response) => {
    // Get the quest document
    const quest = await PointReward.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    // Get quest variant based on quest interaction variant
    const variant = questInteractionVariantMap[quest.interaction];

    // Get platform user id for account
    const platformUserId = QuestService.findUserIdForInteraction(account, quest.interaction);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    // Get validation result for this quest entry
    const data = { platformUserId };
    const { result, reason } = await QuestService.getValidationResult(variant, { quest, account, wallet, data });
    if (!result) return res.json({ error: reason });

    // Little exception here in order to store public metrics with the entry
    if (variant === QuestVariant.Twitter) {
        const user = await TwitterUser.findOne({ userId: platformUserId });
        data['publicMetrics'] = user.publicMetrics;
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
