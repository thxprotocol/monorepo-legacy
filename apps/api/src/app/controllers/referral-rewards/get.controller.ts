import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const quest = await ReferralReward.findById(req.params.id);
    if (!quest) throw new NotFoundError();

    res.json({ ...quest.toJSON(), poolAddress: pool.address });
};

export default { controller, validation };
