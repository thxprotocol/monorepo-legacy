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

    async decorate({ reward }: { reward: TRewardGalachain; account?: TAccount }): Promise<any> {
        const contract = {
            channelName: reward.contractChannelName,
            chaincodeName: reward.contractChaincodeName,
            contractName: reward.contractContractName,
        };
        const token = {
            collection: reward.tokenCollection,
            category: reward.tokenCategory,
            type: reward.tokenType,
            additionalKey: reward.tokenAdditionalKey,
            instance: new BigNumber(0),
        };
        const pool = await PoolService.getById(reward.poolId);
        const [balance] = (await GalachainService.balanceOf(
            contract,
            token,
            pool.settings.galachainPrivateKey,
        )) as any[];
        const paymentCount = await this.models.payment.countDocuments({
            rewardId: reward._id,
        });
        const progress = {
            count: paymentCount,
            limit: Number(balance.quantity) + paymentCount,
        };

        return { ...reward.toJSON(), progress, limit: balance.quantity };
    }

    async decoratePayment(payment: TRewardPayment): Promise<TRewardGalachainPayment> {
        const reward = await this.models.reward.findById(payment.rewardId);
        return { reward, ...payment.toJSON() };
    }

    async getValidationResult({ reward }: { reward: any; account?: TAccount }): Promise<TValidationResult> {
        const { tokenCollection, tokenCategory, tokenType, tokenAdditionalKey } = reward;
        const token = {
            collection: tokenCollection,
            category: tokenCategory,
            type: tokenType,
            additionalKey: tokenAdditionalKey,
            instance: new BigNumber(0),
        };
        const contract = {
            channelName: reward.contractChannelName,
            chaincodeName: reward.contractChaincodeName,
            contractName: reward.contractContractName,
            methodName: 'TransferToken',
        };
        const pool = await PoolService.getById(reward.poolId);

        // Check balance of the distributor
        const [balance] = (await GalachainService.balanceOf(
            contract,
            token,
            pool.settings.galachainPrivateKey,
        )) as any[];

        if (Number(balance.quantity) < reward.amount) {
            return { result: false, reason: 'Distributor has an insufficient balance' };
        }

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
        const token = this.getToken(reward);
        const contract = this.getContract(reward);
        const pool = await PoolService.getById(reward.poolId);

        // Get first token from balance
        const instanceId = await this.getInstance(contract, token, pool);

        // Transfer token to user wallet
        await GalachainService.transfer(
            contract,
            token,
            wallet.address,
            Number(reward.amount),
            instanceId,
            pool.settings.galachainPrivateKey,
        );

        // Register payment
        await this.models.payment.create({
            sub: wallet.sub,
            walletId: wallet._id,
            rewardId: reward._id,
            amount: reward.amount,
        });
    }

    private async getInstance(contract: TGalachainContract, token: TGalachainToken, pool: TPool) {
        const [balance] = (await GalachainService.balanceOf(
            contract,
            token,
            pool.settings.galachainPrivateKey,
        )) as any[];
        const [instanceId] = balance.instanceIds;
        return instanceId;
    }

    private getToken(reward: TRewardGalachain) {
        return {
            collection: reward.tokenCollection,
            category: reward.tokenCategory,
            type: reward.tokenType,
            additionalKey: reward.tokenAdditionalKey,
        };
    }

    private getContract(reward: TRewardGalachain) {
        return {
            channelName: reward.contractChannelName,
            chaincodeName: reward.contractChaincodeName,
            contractName: reward.contractContractName,
        };
    }
}
