import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { ReferralRewardClaim } from '@thxnetwork/api/models/ReferralRewardClaim';
import { Claim } from '@thxnetwork/api/models/Claim';

export const validation = [param('id').isMongoId()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { sub, address } = req.assetPool;

    if (sub !== req.auth.sub) throw new ForbiddenError('Only the pool owner can access this pool info');
    if (!address) return res.json(req.assetPool.toJSON());

    const result: any = {
        ...req.assetPool.toJSON(),
        metrics: {
            claims: await Claim.count({ poolId: String(req.assetPool._id) }),
            referrals: await ReferralRewardClaim.count({ poolId: String(req.assetPool._id) }),
        },
    };

    res.json(result);
};

export default { controller, validation };
