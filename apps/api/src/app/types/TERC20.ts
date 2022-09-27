import { ChainId, ERC20Type } from './enums';
import { Contract } from 'web3-eth-contract';

export type TERC20 = {
    type: ERC20Type;
    name: string;
    symbol: string;
    address: string;
    transactions: string[];
    chainId?: ChainId;
    contract?: Contract;
    sub?: string;
    totalSupply: number;
    decimals?: number;
    adminBalance?: number;
    poolBalance?: number; // TODO Should move to TAssetPool
    archived: boolean;
    logoImgUrl?: string;
};

export type TERC20Token = {
    sub?: string;
    erc20Id: string;
    balance?: number;
};
