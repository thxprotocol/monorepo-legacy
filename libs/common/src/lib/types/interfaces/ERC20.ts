import { ChainId, ERC20Type } from '@thxnetwork/types/enums';
import { Contract } from 'web3-eth-contract';

export type TERC20 = {
    _id: string;
    type: ERC20Type;
    name: string;
    symbol: string;
    address: string;
    transactions: string[];
    chainId?: ChainId;
    contract?: Contract;
    contractName?: string;
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
    walletId: string;
};

export type TERC20Transfer = {
    erc20: string;
    from: string;
    to: string;
    chainId: ChainId;
    transactionId: string;
    sub: string;
};
