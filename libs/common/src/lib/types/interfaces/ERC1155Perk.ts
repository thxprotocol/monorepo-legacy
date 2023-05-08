import { TBasePerk } from './BaseReward';

export type TERC1155Perk = TBasePerk & {
    erc1155Id: string;
    erc1155metadataId: string;
};
