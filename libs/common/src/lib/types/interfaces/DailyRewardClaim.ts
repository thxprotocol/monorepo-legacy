import { DailyRewardClaimState } from '@thxnetwork/types/enums/DailyRewardClaimState';
export type TDailyRewardClaim = {
    questId: string;
    sub: string;
    walletId: string;
    uuid: string;
    amount: string;
    poolId: string;
    createdAt: Date;
    state: DailyRewardClaimState;
};
