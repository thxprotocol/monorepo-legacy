type TERC1155MetadataProp = {
    name: string;
    propType: string;
    description: string;
};

type TERC1155Token = {
    _id: string;
    sub: string;
    state: ERC1155TokenState;
    recipient: string;
    failReason: string;
    transactions: string[];
    tokenId: number;
    tokenUri: string;
    metadataId: string;
    erc1155Id: string;
    walletId: string;
    metadata: TERC1155Metadata;
    balance: string;
};

type TERC1155 = {
    id?: string;
    variant: NFTVariant;
    sub: string;
    chainId: ChainId;
    name: string;
    logoImgUrl: string;
    transactions?: string[];
    baseURL?: string;
    description?: string;
    contract?: Contract;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
    archived?: boolean;
};

type TERC1155Metadata = {
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
