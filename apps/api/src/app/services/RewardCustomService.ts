import { Identity, RewardCustom, RewardCustomPayment, Webhook } from '../models';
import { IRewardService } from './interfaces/IRewardService';
import { Event } from '@thxnetwork/common/enums';
import WebhookService from './WebhookService';

export default class RewardCustomService implements IRewardService {
    models = {
        reward: RewardCustom,
        payment: RewardCustomPayment,
    };

    async decorate({ reward, account }) {
        const identities = account ? await Identity.find({ poolId: reward.poolId, sub: account.sub }) : [];
        return { ...reward.toJSON(), isDisabled: !identities.length };
    }

    async decoratePayment(payment: TRewardPayment): Promise<TRewardPayment> {
        return payment;
    }

    async getValidationResult({ reward, account }: { reward: TReward; account?: TAccount }) {
        const identities = account ? await Identity.find({ poolId: reward.poolId, sub: account.sub }) : [];
        if (!identities.length) return { result: false, reason: 'No identity connected for this campaign.' };

        return { result: true, reason: '' };
    }

    create(data: Partial<TReward>) {
        return this.models.reward.create(data);
    }

    update(reward: TReward, updates: Partial<TReward>): Promise<TReward> {
        return this.models.reward.findByIdAndUpdate(reward._id, updates, { new: true });
    }

    remove(reward: TReward): Promise<void> {
        return this.models.reward.findByIdAndDelete(reward._id);
    }

    findById(id: string): Promise<TReward> {
        return this.models.reward.findById(id);
    }

    async createPayment({
        reward,
        account,
    }: {
        reward: TReward;
        account: TAccount;
    }): Promise<TValidationResult | void> {
        const webhook = await Webhook.findById(reward.webhookId);
        if (!webhook) return { result: false, reason: 'Webhook not found.' };

        // Call the webhook with known account identities for this campaign and optional metadata
        await WebhookService.requestAsync(webhook, account.sub, {
            type: Event.RewardCustomPayment,
            data: { customRewardId: reward._id, metadata: reward.metadata },
        });

        // Register the payment
        await this.models.payment.create({
            rewardId: reward.id,
            poolId: reward.poolId,
            sub: account.sub,
            amount: reward.pointPrice,
        });
    }
}
