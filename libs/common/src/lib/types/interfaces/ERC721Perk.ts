import { TBaseReward } from './BaseReward';

export type TERC721Perk = TBaseReward & {
    erc1155Id: string;
    erc721Id: string;
    erc1155Amount: number;
    metadataId: string;
    tokenId: string;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    price: number;
    priceCurrency: string;
    redirectUrl: string;
};
