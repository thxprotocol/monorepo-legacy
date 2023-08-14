import { TBasePerk } from './BaseReward';

export type TCustomReward = TBasePerk & {
    webhookId: string;
};
