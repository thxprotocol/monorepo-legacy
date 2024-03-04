import { Identity, RewardCustom, RewardCustomPayment, WalletDocument } from '../models';
import { IRewardService } from './interfaces/IRewardService';

export default class RewardCustomService implements IRewardService {
    models = {
        reward: RewardCustom,
        payment: RewardCustomPayment,
    };

    async decorate({ reward, account }) {
        const identities = account ? await Identity.find({ poolId: reward.poolId, account }) : [];
        return { ...reward.toJSON(), isDisabled: !identities.length };
    }

    async decoratePayment(payment: TRewardPayment): Promise<TRewardPayment> {
        return payment;
    }

    async getValidationResult(data: { reward: TReward; account?: TAccount }) {
        return { result: true, reason: '' };
    }

    create(data: Partial<TReward>) {
        return this.models.reward.create(data);
    }

    update(reward: TReward, updates: Partial<TReward>): Promise<TReward> {
        return this.models.reward.findByIdAndUpdate(reward, updates, { new: true });
    }

    remove(reward: TReward): Promise<void> {
        return this.models.reward.findByIdAndDelete(reward._id);
    }

    findById(id: string): Promise<TReward> {
        return this.models.reward.findById(id);
    }

    createPayment({ reward, safe }: { reward: TReward; safe: WalletDocument }): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
