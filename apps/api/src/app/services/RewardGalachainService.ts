import { RewardGalachain, RewardGalachainPayment, WalletDocument } from '../models';
import GalachainService from './GalachainService';
import { IRewardService } from './interfaces/IRewardService';
import { BigNumber } from 'bignumber.js';
import PoolService from './PoolService';

export default class RewardGalachainService implements IRewardService {
    models = {
        reward: RewardGalachain,
        payment: RewardGalachainPayment,
    };

    decorate({ reward }: { reward: TRewardGalachain; account?: TAccount }): Promise<any> {
        return reward.toJSON();
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
        const { tokenCollection, tokenCategory, tokenType, tokenAdditionalKey } = reward;
        const token = {
            collection: tokenCollection,
            category: tokenCategory,
            type: tokenType,
            additionalKey: tokenAdditionalKey,
            instance: new BigNumber(0),
        };
        const dto = await GalachainService.createTransferDto({
            to: wallet.address,
            amount: reward.amount,
            token,
        });
        const contract = {
            channelName: reward.contractChannelName,
            chaincodeName: reward.contractChaincodeName,
            contractName: reward.contractContractName,
        };
        const pool = await PoolService.getById(reward.poolId);

        return await GalachainService.invokeContract({ contract, dto, privateKey: pool.settings.galachainPrivateKey });
    }
    //
}
