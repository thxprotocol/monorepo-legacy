import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Claim } from '@thxnetwork/api/models/Claim';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);

    if (pool.sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!pool.address) return res.json(pool.toJSON());

    const result: any = {
        ...pool.toJSON(),
        metrics: {
            claims: await Claim.count({ poolId: pool._id }),
            referrals: await ReferralRewardClaim.count({ poolId: pool._id }),
        },
    };

    res.json(result);
};

export default { controller, validation };
