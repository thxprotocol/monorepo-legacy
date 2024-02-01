import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';

const validation = [param('id').isMongoId()];

const controller = async ({ params, account, wallet }: Request, res: Response) => {
    const quest = await DailyReward.findById(params.id);
    if (!quest) throw new NotFoundError('Could not find the Daily Reward');

    const { result, reason } = await QuestService.getValidationResult(quest.variant, quest, account, wallet, {});
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Daily,
        questId: String(quest._id),
        sub: account.sub,
        data: {},
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
