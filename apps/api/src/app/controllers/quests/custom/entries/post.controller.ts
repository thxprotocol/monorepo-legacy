import { Request, Response } from 'express';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { param } from 'express-validator';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async ({ params, account, wallet }: Request, res: Response) => {
    const quest = await MilestoneReward.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found.');

    const { result, reason } = await QuestService.getValidationResult(quest.variant, quest, account, wallet, {});
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Custom,
        questId: String(quest._id),
        sub: account.sub,
        data: {
            isClaimed: true,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
