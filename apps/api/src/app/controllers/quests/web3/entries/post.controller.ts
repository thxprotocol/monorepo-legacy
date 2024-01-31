import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { validate } from 'uuid';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import { recoverSigner } from '@thxnetwork/api/util/network';
import { chainList } from '@thxnetwork/common';
import LockService from '@thxnetwork/api/services/LockService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('uuid').custom((uuid) => validate(uuid)),
    body('signature').isString(),
    body('chainId').isInt(),
];

const controller = async ({ account, wallet, body, params }: Request, res: Response) => {
    const quest = await Web3Quest.findOne({ uuid: params.uuid });
    if (!quest) throw new NotFoundError('Could not find Web3 Quest');

    const isLocked = await LockService.getIsLocked(quest.locks, wallet);
    if (isLocked) {
        return res.json({ error: 'Quest is locked' });
    }

    const address = recoverSigner(body.message, body.signature);
    if (!address) throw new NotFoundError(`Could not recover address from signature.`);

    const { rpc, name } = chainList[body.chainId];
    if (!rpc) throw new NotFoundError(`Could not find RPC for ${name}`);

    const isAvailable = await QuestService.isAvailable(quest.variant, { quest, account, wallet, address });
    if (!isAvailable) throw new Error('Quest is not available at the moment!');

    const { result, reason } = await QuestService.getValidationResult(quest.variant, quest, account, wallet, {
        address,
        rpc,
        chainId: body.chainId,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Web3,
        questId: quest._id,
        sub: account.sub,
        data: {
            chainId: body.chainId,
            address,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
