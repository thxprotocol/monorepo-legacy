import { TAccount } from './Account';
import { TWallet } from './Wallet';

export type TPointRewardClaim = {
    _id: string;
    pointRewardId: string;
    sub: string;
    walletId: string;
    amount: string;
    poolId: string;
    platformUserId: string;
    createdAt: string;
    account?: TAccount;
    wallet?: TWallet;
};
