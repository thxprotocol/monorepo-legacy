import { TBaseReward } from './BaseReward';
import { TTokenGating } from './TokenGating';

export type TERC20Perk = TBaseReward & {
    erc20Id: string;
    amount: string;
    pointPrice: number;
    isPromoted: boolean;
    image?: string;
    tokenGating?: TTokenGating;
};
