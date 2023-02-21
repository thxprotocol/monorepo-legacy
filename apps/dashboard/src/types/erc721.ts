import { IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { AxiosResponse } from 'axios';

export enum ERC721Variant {
    Uknown = -1,
    Default = 0,
    OpenSea = 1,
}

export type TERC721DefaultProp = {
    name: string;
    description: string;
    propType: string;
    value?: string;
    disabled?: boolean;
};
export interface IERC721Metadatas {
    [id: string]: { [id: string]: TERC721Metadata };
}
export interface TERC721Metadata {
    _id: string;
    beneficiary: string;
    title: string;
    description: string;
    metadata: { key: string; value: string }[];
    tokenId: number;
    createdAt: Date;
    attributes: [{ key: string; value: string }];
    tokens: any[];
    page: number;
}

export type TERC721 = {
    _id: string;
    type: ERC721Variant;
    chainId: ChainId;
    poolAddress: string;
    address: string;
    name: string;
    symbol: string;
    totalSupply: string;
    logoURI: string;
    properties: TERC721DefaultProp[];
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
    pool: IPool;
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
