import { Request, Response } from 'express';
import { TMembership } from '@thxnetwork/api/models/Membership';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Memberships']
    const membershipDocs = await MembershipService.findForSub(req.auth.sub);
    const memberships = membershipDocs.map(async (membership) => {
        const m = membership.toJSON();
        const pool = await AssetPoolService.getById(membership.poolId);
        if (!pool) {
            m.isRemoved = true;
        } else {
            m.chainId = pool.chainId;
        }
        return m;
    });
    let result = await Promise.all(memberships);

    if (req.query.chainId) {
        result = result.filter((membership: TMembership) => Number(req.query.chainId) === membership.chainId);
    }

    res.json(result);
};

export default { controller };
