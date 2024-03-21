import { RewardGalachain, RewardGalachainPayment, WalletDocument } from '../models';
import GalachainService from './GalachainService';
import { IRewardService } from './interfaces/IRewardService';

export default class RewardGalachainService implements IRewardService {
    models = {
        reward: RewardGalachain,
        payment: RewardGalachainPayment,
    };

    decorate(data: { reward: any; account?: TAccount }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    decoratePayment(payment: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getValidationResult(data: { reward: any; account?: TAccount }): Promise<TValidationResult> {
        throw new Error('Method not implemented.');
    }
    create(data: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    update(reward: any, updates: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    remove(reward: any): Promise<void> {
        throw new Error('Method not implemented.');
    }
    findById(id: string): Promise<any> {
        throw new Error('Method not implemented.');
    }

    async createPayment({
        reward,
        wallet,
        account,
        safe,
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
