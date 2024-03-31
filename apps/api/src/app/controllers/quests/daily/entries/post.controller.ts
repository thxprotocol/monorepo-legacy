import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import { agenda } from '@thxnetwork/api/util/agenda';
import { QuestDaily } from '@thxnetwork/api/models';
import { getIP } from '@thxnetwork/api/util/ip';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId(), body('recaptcha').isString()];

const controller = async (req: Request, res: Response) => {
    const { params, account } = req;
    const quest = await QuestDaily.findById(params.id);
    if (!quest) throw new NotFoundError('Could not find the Daily Reward');

    // Only do this is no event requirement is set
    const data = { recaptcha: req.body.recaptcha, metadata: {} };
    if (!quest.eventName) {
        data.metadata['ip'] = getIP(req);
    }

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    const { result, reason } = await QuestService.getValidationResult(quest.variant, { quest, account, data });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Daily,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
