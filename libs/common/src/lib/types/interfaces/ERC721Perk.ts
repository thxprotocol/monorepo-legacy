import { TBaseReward } from './BaseReward';

export type TERC721Perk = TBaseReward & {
    erc721metadataId: string;
    pointPrice: number;
    image?: string;
};
