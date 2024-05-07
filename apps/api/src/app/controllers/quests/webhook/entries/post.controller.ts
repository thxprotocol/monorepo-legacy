import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda } from '@thxnetwork/api/util/agenda';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import { QuestWebhook } from '@thxnetwork/api/models';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId()];

const controller = async ({ account, body, params }: Request, res: Response) => {
    const quest = await QuestWebhook.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    const data = {
        recaptcha: body.recaptcha,
    };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    // Validate the result
    const validationResult = await QuestService.getValidationResult(quest.variant, {
        quest,
        account,
        data,
    });
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    // Schedule the job
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Webhook,
        questId: String(quest._id),
        sub: account.sub,
        data: { ...data, metadata: validationResult },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
