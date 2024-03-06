import { CouponCode, RewardCoupon, RewardCouponPayment } from '../models';
import { IRewardService } from './interfaces/IRewardService';

export default class RewardCouponService implements IRewardService {
    models = {
        reward: RewardCoupon,
        payment: RewardCouponPayment,
    };

    async decorate({ reward }) {
        const couponCodes = await CouponCode.find({ couponRewardId: reward._id });
        const progress = {
            count: await this.models.payment.countDocuments({
                rewardId: reward._id,
            }),
            limit: couponCodes.length,
        };

        return { ...reward.toJSON(), progress, limit: couponCodes.length };
    }

    async decoratePayment(payment: TRewardPayment) {
        const code = await CouponCode.findById(payment.couponCodeId);
        return { ...payment.toJSON(), code: code && code.code };
    }

    async getValidationResult({ reward }: { reward: TReward; account?: TAccount }) {
        const couponCode = await CouponCode.findOne({ couponRewardId: String(reward._id), sub: { $exists: false } });
        if (!couponCode) return { result: false, reason: 'No more coupon codes available' };

        return { result: true, reason: '' };
    }

    async create(data: Partial<TReward>) {
        const reward = await this.models.reward.create(data);
        await this.createCouponCodes(reward, data.codes);
        return reward;
    }

    private async createCouponCodes(reward: TRewardCoupon, codes: string[]) {
        await Promise.all(
            codes.map(async (code: string) => await CouponCode.create({ code, couponRewardId: reward._id })),
        );
    }

    async update(reward: TReward, updates: Partial<TReward>): Promise<TReward> {
        await this.createCouponCodes(reward, updates.codes);
        return this.models.reward.findByIdAndUpdate(reward, updates, { new: true });
    }

    remove(reward: TReward): Promise<void> {
        return this.models.reward.findByIdAndDelete(reward._id);
    }

    findById(id: string): Promise<TReward> {
        return this.models.reward.findById(id);
    }

    async createPayment({ reward, account }: { reward: TRewardNFT; account: TAccount }) {
        const couponCode = await CouponCode.findOne({ couponRewardId: reward._id, sub: { $exists: false } });
        if (!couponCode) return { result: false, reason: 'No more coupon codes available' };

        // Change owner of couponCode
        await couponCode.updateOne({ sub: account.sub });

        // Register payment
        await this.models.payment.create({
            couponCodeId: couponCode._id,
            rewardId: reward.id,
            sub: account.sub,
            poolId: reward.poolId,
            amount: reward.pointPrice,
        });
    }
}
