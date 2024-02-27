type TRewardCustom = TReward & {
    webhookId: string;
    metadata: string;
};

type TRewardCustomPayment = {
    rewardId: string;
    sub: string;
    poolId: string;
    amount: number;
};
