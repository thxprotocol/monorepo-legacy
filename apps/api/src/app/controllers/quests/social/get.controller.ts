import { PointReward } from '@thxnetwork/api/models/PointReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { param } from 'express-validator';
import LockService from '@thxnetwork/api/services/LockService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find campaign');

    const quest = await PointReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find quest');

    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);

    const isAvailable = wallet ? await PointRewardService.isAvailable(quest, account, wallet) : false;
    const { messages, pointsAvailable, pointsClaimed, amount } = await PointRewardService.getPointsAvailable(
        quest,
        account,
    );
    const q = PointRewardService.findOne(quest, wallet);
    const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : true;

    res.json({
        ...q,
        amount: amount || quest.amount,
        pointsAvailable,
        pointsClaimed,
        isLocked,
        isClaimed: !isAvailable, // Should deprecate
        isAvailable,
        messages,
    });
};

export default { controller, validation };
