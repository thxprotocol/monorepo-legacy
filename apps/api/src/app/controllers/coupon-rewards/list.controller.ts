import { CouponCode } from '@thxnetwork/api/models/CouponCode';
import { CouponReward, CouponRewardDocument } from '@thxnetwork/api/models/CouponReward';
import { CouponRewardPayment } from '@thxnetwork/api/models/CouponRewardPayment';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const poolId = req.header('X-PoolId');
    const rewards = await paginatedResults(CouponReward, page, limit, { poolId });

    rewards.results = await Promise.all(
        rewards.results.map(async (r: CouponRewardDocument) => {
            const codes = await CouponCode.find({ couponRewardId: r._id });
            const payments = await CouponRewardPayment.find({ poolId, rewardId: String(r._id) });
            return { ...r.toJSON(), codes: codes.map((c) => c.code), payments, limit: 5 };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
