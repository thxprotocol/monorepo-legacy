import { Request, Response } from 'express';
import { QuestCustom } from '@thxnetwork/api/models';
import { body, param } from 'express-validator';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId(), body('recaptcha').isString()];

const controller = async ({ params, body, account }: Request, res: Response) => {
    const quest = await QuestCustom.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found.');

    const data = { recaptcha: body.recaptcha };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    const { result, reason } = await QuestService.getValidationResult(quest.variant, {
        quest,
        account,
        data,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Custom,
        questId: String(quest._id),
        sub: account.sub,
        data: { ...data, isClaimed: true },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
