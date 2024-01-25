import { NFTVariant } from '@thxnetwork/types/enums';
import { TPool } from '@thxnetwork/types/interfaces';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { AxiosResponse } from 'axios';

export enum ERC1155Variant {
    Uknown = -1,
    Default = 0,
    OpenSea = 1,
}

export type TERC1155DefaultProp = {
    name: string;
    description: string;
    propType: string;
    value?: string;
    disabled?: boolean;
};
export interface IERC1155Metadatas {
    [id: string]: { [id: string]: TERC1155Metadata };
}
export interface TERC1155Metadata {
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
}

export type TERC1155 = {
    _id: string;
    sub: string;
    variant: NFTVariant;
    type: ERC1155Variant;
    chainId: ChainId;
    poolAddress: string;
    address: string;
    name: string;
    baseURL: string;
    logoURI: string;
    archived: boolean;
    poolId?: string;
};

export interface IERC1155s {
    [id: string]: TERC1155;
}

export type PaginationParams = Partial<{
    page: number;
    limit: number;
}>;

export type MetadataListProps = PaginationParams & {
    erc1155: TERC1155;
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
        results: TERC1155Metadata[];
    }
>;

export type MetadataByPage = {
    [page: number]: TERC1155Metadata[];
};

export type TMetadataState = {
    [poolId: string]: TMetadataMeta & {
        byPage: MetadataByPage;
    };
};
