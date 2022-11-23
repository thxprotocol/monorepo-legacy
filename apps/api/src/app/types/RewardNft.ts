import { TRewardBase } from './RewardBase';

export type TRewardNft = {
    id: string;
    rewardBaseId: string;
    erc721metadataId: string;
    rewardConditionId?: string;
    rewardBase: TRewardBase;
};
