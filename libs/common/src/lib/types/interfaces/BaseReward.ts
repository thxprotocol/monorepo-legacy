import { TQuest } from '..';
import { QuestVariant, RewardVariant } from '../enums';

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
    pointPrice: number;
    image: string;
    isPromoted: boolean;
    page?: number;
    variant?: RewardVariant;
    createdAt?: string;
    updatedAt?: string;
    claims: [];
    isPublished: boolean;
    gateIds: string[];
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
    gateIds: string[];
    update: (payload: Partial<TQuest>) => Promise<void>;
    delete: (payload: Partial<TQuest>) => Promise<void>;
};
