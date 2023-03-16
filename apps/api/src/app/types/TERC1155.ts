import { Contract } from 'web3-eth-contract';
import { ChainId } from '@thxnetwork/types/enums';

export enum ERC1155TokenState {
    Pending = 0,
    Failed = 1,
    Minted = 2,
}

type TERC1155Attribute = {
    key: string;
    value: string;
};

export type TERC1155MetadataProp = {
    name: string;
    propType: string;
    description: string;
};

export type TERC1155Token = {
    id?: string;
    sub: string;
    state: ERC1155TokenState;
    recipient: string;
    failReason: string;
    transactions: string[];
    tokenId: number;
    metadataId: string;
    erc1155Id?: string;
    metadata?: TERC1155Metadata;
};

export type TERC1155 = {
    id?: string;
    sub: string;
    chainId: ChainId;
    name: string;
    properties: TERC1155MetadataProp[];
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

export type TERC1155Metadata = {
    _id?: string;
    erc1155: string;
    title: string;
    description: string;
    attributes: TERC1155Attribute[];
    tokens?: TERC1155Token[];
    createdAt: Date;
    updatedAt: Date;
};
