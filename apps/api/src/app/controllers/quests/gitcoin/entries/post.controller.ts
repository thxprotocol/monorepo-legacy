import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import { QuestGitcoin } from '@thxnetwork/api/models';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import GitcoinService from '@thxnetwork/api/services/GitcoinService';

const validation = [
    param('id').isMongoId(),
    body('signature').isString(),
    body('chainId').isInt(),
    body('recaptcha').isString(),
];

const controller = async ({ account, body, params }: Request, res: Response) => {
    const quest = await QuestGitcoin.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    const address = recoverSigner(body.message, body.signature);
    const data = { recaptcha: body.recaptcha, metadata: { address } };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    // Add wallet and add score for address
    const { score, error } = await GitcoinService.getScoreUniqueHumanity(
        quest.scorerId,
        data.metadata.address.toLowerCase(),
    );
    if (error) return res.json({ error });
    data.metadata['score'] = score;

    const { result, reason } = await QuestService.getValidationResult(quest.variant, { quest, account, data });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Gitcoin,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
