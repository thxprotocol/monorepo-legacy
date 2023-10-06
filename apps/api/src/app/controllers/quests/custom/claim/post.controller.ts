import { Request, Response } from 'express';
import { MilestoneRewardClaim } from '@thxnetwork/api/models/MilestoneRewardClaims';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
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
    const claim = await MilestoneRewardClaim.findOne({ uuid: req.params.uuid });
    if (!claim) throw new NotFoundError('No custom quest entry for that uuid could be found.');
    if (claim.isClaimed) throw new ForbiddenError('This custom quest entry has already been claimed');

    const quest = await MilestoneReward.findById(claim.milestoneRewardId);
    if (!quest) throw new NotFoundError('No custom quest for the given uuid could be found.');

    const pool = await PoolService.getById(quest.poolId);
    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);
    const entry = await QuestService.complete(QuestVariant.Custom, claim.amount, pool, quest, account, wallet, {
        uuid: req.params.uuid,
        isClaimed: true,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
