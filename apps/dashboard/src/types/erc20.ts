import { ChainId } from './enums/ChainId';

export enum ERC20Type {
    Unknown = -1,
    Limited = 0,
    Unlimited = 1,
}

export type TERC20 = {
    _id: string;
    type: ERC20Type;
    chainId: ChainId;
    address: string;
    name: string;
    symbol: string;
    adminBalance: number;
    totalSupply: number;
    logoURI: string;
    archived: boolean;
    poolBalance?: string;
};

export interface IERC20s {
    [id: string]: TERC20;
}
