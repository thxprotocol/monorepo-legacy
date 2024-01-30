import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { param } from 'express-validator';
import { JobType, questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import { getChainId } from '@thxnetwork/api/services/ContractService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import QuestService from '@thxnetwork/api/services/QuestService';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import LockService from '@thxnetwork/api/services/LockService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const quest = await PointReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Quest not found.');

    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, getChainId());
    const isLocked = await LockService.getIsLocked(quest.locks, wallet);
    if (isLocked) return res.json({ error: 'Quest is locked' });

    const validationResult = await QuestService.validate(quest.variant, quest, account, wallet);
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    const platformUserId = await PointRewardService.getPlatformUserId(quest, account);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    // Get quest variant for quest interaction variant
    const variant = questInteractionVariantMap[quest.interaction];
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant,
        questId: quest._id,
        sub: account.sub,
        data: {
            platformUserId,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
