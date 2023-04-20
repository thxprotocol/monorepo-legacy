import { TBaseReward } from './BaseReward';
import { TTokenGating } from './TokenGating';

export type TERC721Perk = TBaseReward & {
    erc721Id: string;
    erc721metadataId: string;
    erc721tokenId: string;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    price: number;
    priceCurrency: string;
    tokenGating?: TTokenGating;
};
