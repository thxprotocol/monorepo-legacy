import { TBasePerk } from './BaseReward';

export type TERC20Perk = TBasePerk & {
    erc20Id: string;
    amount: string;
};
