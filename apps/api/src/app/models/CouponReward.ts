import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { RewardVariant, TCouponReward } from '@thxnetwork/types/';

export type CouponRewardDocument = mongoose.Document & TCouponReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        variant: { type: Number, default: RewardVariant.Coupon },
        webshopURL: String,
    },
    { timestamps: true },
);

export const CouponReward = mongoose.model<CouponRewardDocument>('couponrewards', schema);
