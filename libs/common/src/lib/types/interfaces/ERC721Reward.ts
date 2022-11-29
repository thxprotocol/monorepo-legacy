import { TBaseReward } from './BaseReward';

export type TERC721Reward = TBaseReward & {
    erc721metadataId: string;
};
