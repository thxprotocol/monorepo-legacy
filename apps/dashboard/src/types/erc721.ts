import { NFTVariant, TPool } from '@thxnetwork/types/index';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { AxiosResponse } from 'axios';
import { TERC1155Metadata } from './erc1155';

export type TNFTMetadata = TERC721Metadata | TERC1155Metadata;

export enum ERC721Variant {
    Uknown = -1,
    Default = 0,
    OpenSea = 1,
}

export interface IERC721Metadatas {
    [id: string]: { [id: string]: TERC721Metadata };
}
export interface TERC721Metadata {
    _id: string;
    beneficiary: string;
    tokenId: number;
    createdAt: Date;
    imageUrl: string;
    name: string;
    image: string;
    description: string;
    externalUrl: string;
    tokens: any[];
    page: number;
    // metadata: { key: string; value: string }[];
    // attributes: [{ key: string; value: string }];
}

export type TERC721 = {
    _id: string;
    sub: string;
    type: ERC721Variant;
    chainId: ChainId;
    variant: NFTVariant;
    poolAddress: string;
    address: string;
    baseURL: string;
    name: string;
    symbol: string;
    totalSupply: string;
    logoURI: string;
    archived: boolean;
    poolId?: string;
};

export interface IERC721s {
    [id: string]: TERC721;
}

export type PaginationParams = Partial<{
    page: number;
    limit: number;
}>;

export type MetadataListProps = PaginationParams & {
    erc721: TERC721;
    pool: TPool;
    query?: string;
};

export type TMetadataMeta = {
    limit: number;
    total: number;
    next?: { page: number };
    previous?: { page: number };
};

export type TMetadataResponse = AxiosResponse<
    TMetadataMeta & {
        results: TERC721Metadata[];
    }
>;

export type MetadataByPage = {
    [page: number]: TERC721Metadata[];
};

export type TMetadataState = {
    [poolId: string]: TMetadataMeta & {
        byPage: MetadataByPage;
    };
};

export type TERC721Token = {
    _id: string;
    tokenId: number;
    erc721Id: string;
};

export interface IERC721Tokens {
    [id: string]: { [id: string]: TERC721Token };
}
