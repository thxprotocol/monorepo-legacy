import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC20PerkService from '@thxnetwork/api/services/ERC20PerkService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsToken']
    const perk = await ERC20PerkService.get(req.params.id);
    if (!perk) throw new NotFoundError();

    const claims = await ClaimService.findByPerk(perk);
    const payments = await ERC20PerkPayment.find({ perkId: perk._id });
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const withdrawals = await WithdrawalService.findByQuery({
        poolId: pool._id,
        rewardId: perk._id,
    });

    res.json({ ...perk.toJSON(), claims, poolAddress: pool.safeAddress, progress: withdrawals.length, payments });
};

export default { controller, validation };
