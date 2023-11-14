import { Request, Response } from 'express';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { param } from 'express-validator';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import WalletService from '@thxnetwork/api/services/WalletService';
import QuestService from '@thxnetwork/api/services/QuestService';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
    const quest = await PointReward.findById(req.params.id);
    const account = await AccountProxy.getById(req.auth.sub);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const wallet = await WalletService.findPrimary(req.auth.sub, pool.chainId);

    const isCompletedAlready = await PointRewardService.isCompleted(quest, account, wallet);
    if (isCompletedAlready) return res.json({ error: 'You have completed this quest already.' });

    const failReason = await PointRewardService.isValid(quest, account);
    if (failReason) return res.json({ error: failReason });

    const variant = questInteractionVariantMap[quest.interaction];
    const pointsAvailable = await PointRewardService.getPointsAvailable(quest, account);
    const platformUserId = await PointRewardService.getPlatformUserId(quest, account);
    const entry = await QuestService.complete(variant, pointsAvailable, pool, quest, account, wallet, {
        pointRewardId: quest._id,
        platformUserId,
    });

    res.status(201).json(entry);
};

export default { controller, validation };
