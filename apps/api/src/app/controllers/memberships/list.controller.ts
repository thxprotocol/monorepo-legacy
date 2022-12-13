import { Request, Response } from 'express';
import { TMembership } from '@thxnetwork/api/models/Membership';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Memberships']
    const membershipDocs = await MembershipService.findForSub(req.auth.sub);
    const memberships = membershipDocs.map(async (membership) => {
        const m = membership.toJSON();
        const pool = await PoolService.getById(membership.poolId);
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
