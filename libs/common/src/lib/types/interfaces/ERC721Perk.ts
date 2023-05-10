import { TBasePerk } from './BaseReward';

export type TERC721Perk = TBasePerk & {
    erc1155Id: string;
    erc721Id: string;
    erc1155Amount: string;
    metadataId: string;
    tokenId: string;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    price: number;
    priceCurrency: string;
};
