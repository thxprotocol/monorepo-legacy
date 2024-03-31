import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { QuestWeb3 } from '@thxnetwork/api/models/QuestWeb3';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { agenda } from '@thxnetwork/api/util/agenda';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { chainList } from '@thxnetwork/common/chains';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import QuestWeb3Service from '@thxnetwork/api/services/QuestWeb3Service';
import QuestService from '@thxnetwork/api/services/QuestService';

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

    const data = { recaptcha: body.recaptcha, metadata: { address, rpc, chainId: body.chainId, callResult: '' } };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    // Fetch the call result so we can store it in the entry
    const callResult = await QuestWeb3Service.getCallResult({ quest, account, data });
    if (!callResult.result) return res.json({ error: callResult.reason });
    data.metadata.callResult = callResult.value.toString();

    // Validate the result
    const validationResult = await QuestService.getValidationResult(quest.variant, {
        quest,
        account,
        data,
    });
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    // Schedule the job
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Web3,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
