import { TBasePerk } from './BaseReward';

export type TERC721Perk = TBasePerk & {
    erc721Id: string;
    erc721metadataId: string;
    erc721tokenId: string;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    price: number;
    priceCurrency: string;
};
