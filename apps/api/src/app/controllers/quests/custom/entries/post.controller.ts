import { Request, Response } from 'express';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { param } from 'express-validator';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const quest = await MilestoneReward.findOne({ uuid: req.params.uuid });
    if (!quest) return res.json({ error: 'This quest is no longer available.' });

    const { result, reason } = await QuestService.getValidationResult(
        quest.variant,
        quest,
        req.account,
        req.wallet,
        {},
    );
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Custom,
        questId: String(quest._id),
        sub: req.account.sub,
        data: {
            isClaimed: true,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
