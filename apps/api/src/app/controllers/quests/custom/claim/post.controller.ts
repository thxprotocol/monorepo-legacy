import { Request, Response } from 'express';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { param } from 'express-validator';
import { validate } from '@thxnetwork/api/services/PerkService';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('uuid').custom((uuid) => validate(uuid))];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const quest = await MilestoneReward.findOne({ uuid: req.params.uuid });
    if (!quest) return res.json({ error: 'This quest is no longer available.' });

    const pool = await PoolService.getById(quest.poolId);
    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    if (!wallet) {
        return res.json({ error: 'No wallet found for this account' });
    }

    const validationResult = await QuestService.validate(QuestVariant.Custom, quest, account, wallet);
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    const entry = await QuestService.complete(QuestVariant.Custom, quest.amount, pool, quest, account, wallet, {
        milestoneRewardId: quest._id,
        isClaimed: true,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
