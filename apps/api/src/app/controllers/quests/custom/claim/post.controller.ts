import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { param } from 'express-validator';
import { validate } from '@thxnetwork/api/services/PerkService';
import { QuestVariant } from '@thxnetwork/common/lib/types';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { Identity } from '@thxnetwork/api/models/Identity';
import { Event } from '@thxnetwork/api/models/Event';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('uuid').custom((uuid) => validate(uuid))];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const quest = await MilestoneReward.findOne({ uuid: req.params.uuid });
    if (!quest) throw new NotFoundError('No custom quest for the given uuid could be found.');

    const pool = await PoolService.getById(quest.poolId);
    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const identity = await Identity.findOne({ poolId: pool._id, sub: account.sub });

    const entries = await MilestoneRewardClaim.find({
        milestoneRewardId: quest._id,
        walletId: wallet._id,
        isClaimed: true,
    });
    if (entries.length >= quest.limit) {
        return res.json({ error: 'Quest entry limit has been reached.' });
    }

    const events = await Event.find({ identityId: identity._id, poolId: pool._id });
    if (entries.length >= events.length) {
        return res.json({ error: 'Insufficient custom events are found for this quest.' });
    }

    const entry = await QuestService.complete(QuestVariant.Custom, quest.amount, pool, quest, account, wallet, {
        milestoneRewardId: quest._id,
        isClaimed: true,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
