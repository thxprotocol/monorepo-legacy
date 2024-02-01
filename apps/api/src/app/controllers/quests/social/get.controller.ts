import { PointReward } from '@thxnetwork/api/models/PointReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import PoolService from '@thxnetwork/api/services/PoolService';
import LockService from '@thxnetwork/api/services/LockService';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.header('X-PoolId'));
    if (!pool) throw new NotFoundError('Could not find campaign');

    const quest = await PointReward.findById(req.params.id);
    if (!quest) throw new NotFoundError('Could not find quest');

    const account = await AccountProxy.getById(req.auth.sub);
    const wallet = await SafeService.findPrimary(req.auth.sub, pool.chainId);

    const isAvailable = wallet ? await QuestService.isAvailable(quest.variant, { quest, account, wallet }) : false;
    const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : true;
    const socialQuest = await QuestService.decorate(quest.variant, quest._id, wallet);

    res.json({
        ...socialQuest,
        isLocked,
        isClaimed: !isAvailable, // Should deprecate
        isAvailable,
    });
};

export default { controller, validation };
