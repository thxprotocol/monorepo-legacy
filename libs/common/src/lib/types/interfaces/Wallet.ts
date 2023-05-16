import { ChainId } from '../enums';

export type TWallet = {
    _id?: string;
    sub: string;
    address: string;
    chainId: ChainId;
};
