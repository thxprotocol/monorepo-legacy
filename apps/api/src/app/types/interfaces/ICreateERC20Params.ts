import { ERC20Type, ChainId } from '@thxnetwork/common/enums';

export interface ICreateERC20Params {
    name: string;
    symbol: string;
    totalSupply: string;
    chainId: ChainId;
    type: ERC20Type;
    sub: string;
    address?: string;
    logoImgUrl?: string;
}

export interface CreateERC20Params {
    name: string;
    symbol: string;
    totalSupply: string;
    chainId: ChainId;
    sub: string;
}

export interface TransferERC20MintedParams {
    id: string;
    to: string;
    chainId: ChainId;
}

export interface AddTokenToPoolParams {
    sub: string;
    tokenId: string;
    poolId: string;
    chainId: ChainId;
}
