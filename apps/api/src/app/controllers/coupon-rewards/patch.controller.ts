import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';

const validation = [
    param('id').isMongoId(),
    body('webshopURL').optional().isURL({ require_tld: false }),
    body('codes')
        .optional()
        .custom((value: string) => {
            if (!value) return true;
            const arr = JSON.parse(value);
            if (arr.length > 0) return true;
            if (arr.length === 0) return true;
            return false;
        }),
    body('locks')
        .optional()
        .customSanitizer((locks) => locks && JSON.parse(locks)),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));

    const couponReward = await CouponReward.findById(req.params.id);
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

    const reward = await CouponReward.findByIdAndUpdate(req.params.id, { ...req.body, poolId, image }, { new: true });

    res.status(201).json({ ...reward.toJSON(), couponCodes });
};

export default { controller, validation };
