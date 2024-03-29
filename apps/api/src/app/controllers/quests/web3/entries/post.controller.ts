import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { QuestWeb3 } from '@thxnetwork/api/models/QuestWeb3';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda } from '@thxnetwork/api/util/agenda';
import { recoverSigner } from '@thxnetwork/api/util/network';
import QuestService from '@thxnetwork/api/services/QuestService';
import { chainList } from '@thxnetwork/common/chains';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';

const validation = [
    param('id').isMongoId(),
    body('signature').isString(),
    body('chainId').isInt(),
    body('recaptcha').isString(),
];

const controller = async ({ account, body, params }: Request, res: Response) => {
    const quest = await QuestWeb3.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    const address = recoverSigner(body.message, body.signature);
    if (!address) throw new NotFoundError(`Could not recover address from signature.`);

    const { rpc, name } = chainList[body.chainId];
    if (!rpc) throw new NotFoundError(`Could not find RPC for ${name}`);

    const data = { address, rpc, chainId: body.chainId, recaptcha: body.recaptcha };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isBotUser = await QuestService.isBotUser(quest.variant, { quest, account, data });
    if (!isBotUser) return res.json({ error: isBotUser.reason });

    const { result, reason } = await QuestService.getValidationResult(quest.variant, {
        quest,
        account,
        data,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Web3,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
