import { TokenGatingVariant } from '../enums/TokenGatingVariant';

export type TInfoLink = {
    label: string;
    url: string;
};

export type TBasePerk = {
    _id?: string;
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
    createdAt?: string;
    updatedAt?: string;
    claims: [];
};

export type TBaseReward = {
    _id?: string;
    uuid: string;
    poolId: string;
    title: string;
    description: string;
    infoLinks: TInfoLink[];
    createdAt?: string;
    updatedAt?: string;
    page?: number;
};
