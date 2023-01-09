import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import RewardReferralService from '@thxnetwork/api/services/ReferralRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const reward = await RewardReferralService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    res.json({
        ...reward.toJSON(),
        poolAddress: pool.address,
    });
};

export default { controller, validation };
