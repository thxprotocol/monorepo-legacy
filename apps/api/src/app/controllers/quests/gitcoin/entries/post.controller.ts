import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from 'uuid';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { GitcoinQuest } from '@thxnetwork/api/models/GitcoinQuest';
import QuestService from '@thxnetwork/api/services/QuestService';
import { agenda } from '@thxnetwork/api/util/agenda';

const validation = [
    param('uuid').custom((uuid) => validate(uuid)),
    body('signature').isString(),
    body('chainId').isInt(),
];

const controller = async ({ account, wallet, body, params }: Request, res: Response) => {
    const quest = await GitcoinQuest.findOne({ uuid: params.uuid });
    if (!quest) throw new NotFoundError('Could not find Web3 Quest');

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
