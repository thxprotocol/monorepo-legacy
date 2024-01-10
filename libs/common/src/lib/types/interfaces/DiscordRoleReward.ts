import { TBaseReward } from './BaseReward';

export type TDiscordRoleReward = TBaseReward & {
    discordRoleId: string;
};

export type TDiscordRoleRewardPayment = {
    perkId: string;
    discordRoleRewardId: string;
    walletId: string;
    sub: string;
    poolId: string;
    amount: number;
};
