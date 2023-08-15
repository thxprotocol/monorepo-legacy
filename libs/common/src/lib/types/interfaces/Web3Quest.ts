import { TBaseReward } from './BaseReward';

export type TWeb3Quest = TBaseReward & {
    amount: number;
    contractAddress: string;
    methodName: string;
    threshold: number;
};
