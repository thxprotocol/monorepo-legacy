import { Request, Response } from 'express';
import { param } from 'express-validator';
import { DailyReward } from '@thxnetwork/api/services/DailyRewardService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import LockService from '@thxnetwork/api/services/LockService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Daily Reward Claims']
    const quest = await DailyReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find the Daily Reward');

    const pool = await PoolService.getById(quest.poolId);
    if (!pool) throw new NotFoundError('Could not find the campaign for this reward');

    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    if (!wallet) throw new NotFoundError('Could not find wallet');

    const isLocked = await LockService.getIsLocked(quest.locks, wallet);
    if (isLocked) {
        return res.json({ error: 'Quest is locked' });
    }

    const account = await AccountProxy.getById(req.auth.sub);
    if (!wallet) throw new NotFoundError('Could not find account');

    const amount = await QuestService.getAmount(QuestVariant.Daily, quest, account, wallet);
    if (!amount) throw new Error('Could not figure out how much points you should get.');

    const validationResult = await QuestService.validate(QuestVariant.Daily, quest, account, wallet);
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Daily,
        questId: quest._id,
        sub: account.sub,
        data: {},
    });

    return res.status(201).end();
};

export default { controller, validation };
