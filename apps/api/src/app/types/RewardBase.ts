import { RewardVariant } from './enums/RewardVariant';

export type TRewardBase = {
    id: string;
    title: string;
    slug: string;
    variant: RewardVariant;
    poolId: string;
    limit: number;
    expiryDate: Date;
    state: number;
    amount: number;
    isClaimOnce: boolean;
};
