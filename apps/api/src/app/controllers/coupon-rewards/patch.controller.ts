import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { RewardCoupon, CouponCode } from '@thxnetwork/api/models';
import { defaults } from '@thxnetwork/api/util/validation';

const validation = [param('id').isMongoId(), ...defaults.reward];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));

    const couponReward = await RewardCoupon.findById(req.params.id);
    if (couponReward.poolId !== poolId) throw new ForbiddenError('Not your coupon reward');

    const couponCodes = await CouponCode.find({ couponRewardId: couponReward._id });
    if (req.body.codes && req.body.codes.length) {
        const codes = JSON.parse(req.body.codes);
        couponCodes.concat(
            await Promise.all(
                codes.map(async (code) => await CouponCode.create({ code, couponRewardId: couponReward._id })),
            ),
        );
    }

    const reward = await RewardCoupon.findByIdAndUpdate(req.params.id, { ...req.body, poolId, image }, { new: true });

    res.status(201).json({ ...reward.toJSON(), couponCodes });
};

export default { controller, validation };
