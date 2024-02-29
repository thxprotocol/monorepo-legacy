export interface IRewardService {
    findPayments(reward: TReward): Promise<TRewardPayment[]>;
}
