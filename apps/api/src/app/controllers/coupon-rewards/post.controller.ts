import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { body } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { v4 } from 'uuid';
import { CouponCode } from '@thxnetwork/api/models/CouponCode';

const validation = [body('couponCodes').custom((value: string) => value && JSON.parse(value).length > 0)];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const image = req.file && (await ImageService.upload(req.file));

    if (!req.body.couponCodes || !req.body.couponCodes.length) {
        throw new ForbiddenError('Could not find coupon codes');
    }

    const codes = JSON.parse(req.body.couponCodes);
    const reward = await CouponReward.create({ ...req.body, uuid: v4(), poolId, image });
    const couponCodes = await Promise.all(
        codes.map(async (code) => await CouponCode.create({ code, couponRewardId: reward._id })),
    );

    res.status(201).json({ ...reward.toJSON(), couponCodes: couponCodes.map(({ code }) => code) });
};

export default { controller, validation };
