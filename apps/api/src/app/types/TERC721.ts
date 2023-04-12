import { Contract } from 'web3-eth-contract';
import { ChainId } from '@thxnetwork/types/enums';

export enum ERC721TokenState {
    Pending = 0,
    Failed = 1,
    Minted = 2,
    Transferring = 3,
    Transferred = 4,
}

export type TERC721MetadataProp = {
    name: string;
    propType: string;
    description: string;
};

export type TERC721Token = {
    id?: string;
    sub: string;
    state: ERC721TokenState;
    recipient: string;
    failReason: string;
    transactions: string[];
    tokenId: number;
    tokenUri: string;
    metadataId: string;
    erc721Id?: string;
    metadata?: TERC721Metadata;
    walletId: string;
};

export type TERC721 = {
    id?: string;
    sub: string;
    chainId: ChainId;
    name: string;
    symbol: string;
    properties: TERC721MetadataProp[];
    transactions?: string[];
    baseURL?: string;
    description?: string;
    contract?: Contract;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    archived?: boolean;
    logoImgUrl?: string;
};

export type TERC721Metadata = {
    _id?: string;
    erc721Id: string;
    imageUrl: string;
    name: string;
    image: string;
    description: string;
    externalUrl: string;
    tokens?: TERC721Token[];
    createdAt?: Date;
    updatedAt?: Date;
};
