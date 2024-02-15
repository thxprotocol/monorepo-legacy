import { TAccount } from './Account';
import { TWallet } from './Wallet';
import { TTwitterUserPublicMetrics } from './Twitter';

export type TPointRewardClaim = {
    _id: string;
    questId: string;
    sub: string;
    amount: string;
    poolId: string;
    platformUserId: string;
    publicMetrics: TTwitterUserPublicMetrics;
    createdAt: Date;
    account?: TAccount;
    wallet?: TWallet;
};
