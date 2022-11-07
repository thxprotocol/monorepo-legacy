import { ChainId } from './enums/ChainId';

export type TWallet = {
    _id: string;
    address: string;
    sub: string;
    chainId: ChainId;
};
