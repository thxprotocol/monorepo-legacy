import { ChainId } from './enums/ChainId';

export interface TWallet {
    _id: string;
    address: string;
    sub: string;
    chainId: ChainId;
}
