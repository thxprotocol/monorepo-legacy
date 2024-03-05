type TDailyRewardClaim = {
    questId: string;
    sub: string;
    uuid: string;
    amount: string;
    poolId: string;
    createdAt: Date;
    state: DailyRewardClaimState;
    ip?: string;
};
