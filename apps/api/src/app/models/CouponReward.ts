import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { TCouponReward } from '@thxnetwork/types/interfaces';

export type CouponRewardDocument = mongoose.Document & TCouponReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        webshopUrl: String,
    },
    { timestamps: true },
);

export const CouponReward = mongoose.model<CouponRewardDocument>('couponrewards', schema);
