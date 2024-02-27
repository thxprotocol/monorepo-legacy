export interface IRewardService {
    findPayments(reward: TReward): TRewardPayment[];
}
