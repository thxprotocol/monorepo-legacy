import { RewardGalachain, RewardGalachainPayment, WalletDocument } from '../models';
import GalachainService from './GalachainService';
import { IRewardService } from './interfaces/IRewardService';

export default class RewardGalachainService implements IRewardService {
    models = {
        reward: RewardGalachain,
        payment: RewardGalachainPayment,
    };

    decorate({ reward }: { reward: TRewardGalachain; account?: TAccount }): Promise<any> {
        return reward;
    }

    decoratePayment(payment: TRewardPayment): Promise<TRewardGalachainPayment> {
        return this.models.reward.findById(payment.rewardId);
    }

    async getValidationResult(data: { reward: any; account?: TAccount }): Promise<TValidationResult> {
        return { result: true, reason: '' };
    }

    create(data: any): Promise<any> {
        return this.models.reward.create(data);
    }

    update(reward: TReward, updates: Partial<TReward>): Promise<TReward> {
        return this.models.reward.findByIdAndUpdate(reward, updates, { new: true });
    }

    remove(reward: TReward): Promise<void> {
        return this.models.reward.findByIdAndDelete(reward._id);
    }

    findById(id: string) {
        return this.models.reward.findById(id);
    }

    async createPayment({
        reward,
        wallet,
    }: {
        reward: TRewardGalachain;
        account: TAccount;
        safe: WalletDocument;
        wallet?: WalletDocument;
    }): Promise<void | TValidationResult> {
        const dto = await GalachainService.createTransferDto({
            to: wallet.address,
            amount: reward.amount,
            token: reward.token,
        });
        return await GalachainService.invokeContract({ contract: reward.contract, dto, privateKey: reward.privateKey });
    }
    //
}
