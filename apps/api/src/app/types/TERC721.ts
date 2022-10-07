import { Contract } from 'web3-eth-contract';
import { ChainId } from './enums';

export enum ERC721TokenState {
    Pending = 0,
    Failed = 1,
    Minted = 2,
}

type TERC721Attribute = {
    key: string;
    value: string;
};

type TERC721MetadataProp = {
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
    metadataId: string;
    erc721Id?: string;
    metadata?: TERC721Metadata;
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
    erc721: string;
    title: string;
    description: string;
    attributes: TERC721Attribute[];
    tokens?: TERC721Token[];
    createdAt: Date;
    updatedAt: Date;
};
