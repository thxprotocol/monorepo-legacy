import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { RewardCoinPayment } from '@thxnetwork/api/models/RewardCoinPayment';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const perk = await RewardCoinService.get(req.params.id);
    if (!perk) throw new NotFoundError();

    const claims = await ClaimService.findByPerk(perk);
    const payments = await RewardCoinPayment.find({ rewardId: perk._id });
    const pool = await PoolService.getById(req.header('X-PoolId'));

    res.json({ ...perk.toJSON(), claims, poolAddress: pool.safeAddress, payments });
};

export default { controller, validation };
