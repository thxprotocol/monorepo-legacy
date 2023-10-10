import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
export type TDailyRewardClaim = {
    dailyRewardId: string;
    sub: string;
    walletId: string;
    uuid: string;
    amount: string;
    poolId: string;
    createdAt: Date;
    state: DailyRewardClaimState;
};
