import { Model } from 'mongoose';
import { WalletDocument } from '@thxnetwork/api/models';

export interface IRewardService {
    models: {
        reward: Model<TReward>;
        payment: Model<TRewardPayment>;
    };
    decorate(data: { reward: TReward; account?: TAccount }): Promise<TReward>;
    decoratePayment(payment: TRewardPayment): Promise<TRewardPayment>;
    getValidationResult(data: { reward: TReward; account?: TAccount }): Promise<TValidationResult>;
    create(data: Partial<TReward>): Promise<TReward>;
    update(reward: TReward, updates: Partial<TReward>): Promise<TReward>;
    remove(reward: TReward): Promise<void>;
    findById(id: string): Promise<TReward>;
    createPayment({
        reward,
        account,
        safe,
        wallet,
    }: {
        reward: TReward;
        account: TAccount;
        safe: WalletDocument;
        wallet?: WalletDocument;
    }): Promise<TValidationResult | void>;
}
