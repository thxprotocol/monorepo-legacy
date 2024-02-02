import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { GitcoinQuest } from '@thxnetwork/api/models/GitcoinQuest';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId(), body('signature').isString(), body('chainId').isInt()];

const controller = async ({ account, wallet, body, params }: Request, res: Response) => {
    const quest = await GitcoinQuest.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    const address = recoverSigner(body.message, body.signature);
    const { result, reason } = await QuestService.getValidationResult(quest.variant, quest, account, wallet, {
        address,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Gitcoin,
        questId: String(quest._id),
        sub: account.sub,
        data: {
            address,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
