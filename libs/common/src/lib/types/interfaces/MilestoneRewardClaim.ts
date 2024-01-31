export type TMilestoneRewardClaim = {
    questId: string;
    sub: string;
    walletId: string;
    uuid: string;
    amount: number;
    isClaimed: boolean;
    poolId: string;
    createdAt: Date;
    eventName: string;
};
