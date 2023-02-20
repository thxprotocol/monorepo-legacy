import { TBaseReward } from './BaseReward';

export type TERC721Perk = TBaseReward & {
    erc721Id: string;
    erc721metadataId: string;
    erc721tokenId: string;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    price: number;
    priceCurrency: string;
    paymentLinkId: string;
};
