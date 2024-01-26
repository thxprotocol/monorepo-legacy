import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { param } from 'express-validator';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import QuestService from '@thxnetwork/api/services/QuestService';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import LockService from '@thxnetwork/api/services/LockService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const quest = await PointReward.findById(req.params.id);
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const isLocked = await LockService.getIsLocked(quest.locks, wallet);
    if (isLocked) {
        return res.json({ error: 'Quest is locked' });
    }

    // Get quest variant for quest interaction variant
    const variant = questInteractionVariantMap[quest.interaction];

    const validationResult = await QuestService.validate(quest.variant, quest, account, wallet);
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    const platformUserId = await PointRewardService.getPlatformUserId(quest, account);
    if (!platformUserId) return res.json({ error: 'Could not find platform user id.' });

    const amount = await QuestService.getAmount(variant, quest, account, wallet);
    const entry = await QuestService.complete(variant, amount, pool, quest, account, wallet, {
        questId: quest._id,
        platformUserId,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
