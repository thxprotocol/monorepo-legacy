import { Request, Response } from 'express';
import { query } from 'express-validator';
import ReferralRewardClaimService from '@thxnetwork/api/services/ReferralRewardClaimService';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards Referral Claims']
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;

    const reward = await ReferralReward.findOne({ uuid: req.params.uuid });
    if (!reward) {
        throw new NotFoundError('Could not found the reward');
    }

    const data = await ReferralRewardClaimService.findByReferralRewardPaginated(reward, page, limit);
    const promises = data.results.map(async (claim) => {
        const account = await AccountProxy.getById(claim.sub);
        return {
            email: account.email,
            ...claim.toJSON(),
            createdAt: claim.createdAt,
        };
    });
    data.results = await Promise.all(promises);
    res.json(data);
};

export default { controller, validation };
