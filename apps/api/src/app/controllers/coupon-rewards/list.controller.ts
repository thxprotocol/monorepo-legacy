import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { RewardCoupon, RewardCouponDocument } from '@thxnetwork/api/models';
import { RewardCouponPayment } from '@thxnetwork/api/models/RewardCouponPayment';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const poolId = req.header('X-PoolId');
    const rewards = await paginatedResults(RewardCoupon, page, limit, { poolId });

    rewards.results = await Promise.all(
        rewards.results.map(async (r: RewardCouponDocument) => {
            const couponCodes = await CouponCode.find({ couponRewardId: r._id });
            const payments = await RewardCouponPayment.find({ poolId, rewardId: String(r._id) });
            return { ...r.toJSON(), couponCodes, payments, limit: couponCodes.length };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
