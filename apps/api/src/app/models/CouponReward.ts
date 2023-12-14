import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { RewardVariant } from '@thxnetwork/types/enums';
import { TCouponReward } from '@thxnetwork/types/interfaces';

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
