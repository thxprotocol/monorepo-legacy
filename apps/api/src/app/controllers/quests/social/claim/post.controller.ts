import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { PointRewardClaim } from '@thxnetwork/api/models/PointRewardClaim';
import { getPlatformUserId, validateCondition } from '@thxnetwork/api/util/condition';
import { param } from 'express-validator';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const quest = await PointReward.findById(req.params.id);
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await WalletService.findPrimary(req.auth.sub, pool.chainId);

    let ids: any[] = [{ sub: req.auth.sub }, { walletId: wallet._id }];

    // We validate for both here since there are claims that only contain a sub and should not be claimed again
    const platformUserId = await getPlatformUserId(account, quest);
    if (platformUserId) ids = [...ids, { platformUserId }];

    const isCompletedAlready = await PointRewardClaim.exists({
        pointRewardId: quest._id,
        $or: ids,
    });
    if (isCompletedAlready) return res.json({ error: 'You have completed this quest already.' });

    const failReason = await validateCondition(account, quest);
    if (failReason) return res.json({ error: failReason });

    const variant = questInteractionVariantMap[quest.interaction];
    const entry = await QuestService.complete(variant, quest.amount, pool, quest, account, wallet, {
        pointRewardId: quest._id,
        platformUserId,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
