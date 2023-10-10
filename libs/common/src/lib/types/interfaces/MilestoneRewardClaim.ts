export type TMilestoneRewardClaim = {
    milestoneRewardId: string;
    sub: string;
    walletId: string;
    uuid: string;
    amount: number;
    isClaimed: boolean;
    poolId: string;
    createdAt: Date;
};
