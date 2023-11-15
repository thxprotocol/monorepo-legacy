import { TBasePerk } from './BaseReward';

export type TDiscordRoleReward = TBasePerk & {
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
