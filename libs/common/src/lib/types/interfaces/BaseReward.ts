import { TQuest } from '..';
import { QuestVariant, RewardVariant, TokenGatingVariant } from '../enums';

export type TInfoLink = {
    label: string;
    url: string;
};

export type TBasePerk = {
    _id: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    expiryDate: Date;
    claimAmount: number;
    claimLimit: number;
    limit: number;
    tokenGatingVariant: TokenGatingVariant;
    tokenGatingContractAddress: string;
    tokenGatingAmount: number;
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    page?: number;
    variant?: RewardVariant;
    createdAt?: string;
    updatedAt?: string;
    claims: [];
    isPublished: boolean;
};

export type TBaseReward = {
    _id: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    image: string;
    infoLinks: TInfoLink[];
    createdAt: string;
    updatedAt: string;
    page?: number;
    variant?: QuestVariant;
    index: number;
    isPublished: boolean;
    expiryDate: Date;
    update: (payload: Partial<TQuest>) => Promise<void>;
    delete: (payload: Partial<TQuest>) => Promise<void>;
};
