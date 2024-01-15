import { TQuest } from '..';
import { QuestVariant, RewardVariant } from '../enums';

export type TInfoLink = {
    label: string;
    url: string;
};
export type TQuestLock = { variant: QuestVariant; questId: string };

export type TBaseReward = {
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
    locks: TQuestLock[];
};

export type TBaseQuest = {
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
    locks: TQuestLock[];
    update: (payload: Partial<TQuest>) => Promise<void>;
    delete: (payload: Partial<TQuest>) => Promise<void>;
};
