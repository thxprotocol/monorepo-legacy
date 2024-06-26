import { ChainId } from '@thxnetwork/common/enums';

export enum ERC20Type {
    Unknown = -1,
    Limited = 0,
    Unlimited = 1,
}

export type TERC20 = {
    _id: string;
    type: ERC20Type;
    sub: string;
    chainId: ChainId;
    address: string;
    name: string;
    symbol: string;
    adminBalance: number;
    totalSupply: number;
    logoURI?: string;
    archived: boolean;
    poolBalance?: string;
    poolId?: string;
    logoImgUrl?: string;
};

export interface IERC20s {
    [id: string]: TERC20;
}

export type TERC20BalanceState = {
    [tokenAddress: string]: {
        [address: string]: string;
    };
};

export type TERC20AllowanceState = {
    [tokenAddress: string]: {
        [poolAddress: string]: {
            [spender: string]: string;
        };
    };
};
