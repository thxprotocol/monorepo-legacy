import { ChainId } from '../enums';
import { Contract } from 'web3-eth-contract';

export type TWallet = {
    _id?: string;
    sub: string;
    address: string;
    chainId: ChainId;
    poolId?: string;
    token?: string;
    contract?: Contract;
    version?: string;
    isUpgradeAvailable?: boolean;
};
