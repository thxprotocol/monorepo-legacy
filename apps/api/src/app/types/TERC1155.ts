import { Contract } from 'web3-eth-contract';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';

export enum ERC1155TokenState {
    Pending = 0,
    Failed = 1,
    Minted = 2,
    Transferring = 3,
    Transferred = 4,
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
    tokenUri: string;
    metadataId: string;
    erc1155Id?: string;
    metadata?: TERC1155Metadata;
    walletId: string;
};

export type TERC1155 = {
    id?: string;
    variant: NFTVariant;
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
    erc1155Id: string;
    tokenId: number;
    imageUrl: string;
    name: string;
    image: string;
    description: string;
    externalUrl: string;
    tokens?: TERC1155Token[];
    createdAt: Date;
    updatedAt: Date;
};
