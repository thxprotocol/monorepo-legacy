import { AccountPlanType, ChainId } from '@thxnetwork/api/types/enums';
export interface IAccount {
    id?: string;
    address: string;
    privateKey: string;
    googleAccess: boolean;
    twitterAccess: boolean;
    youtube?: any;
    twitter?: any;
    plan: AccountPlanType;
    email: string;
}
export interface ERC20Token {
    chainId: ChainId;
    address: string;
}

export interface AuthToken {
    accessToken: string;
    kind: string;
}

export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    privateKey?: string;
    authenticationToken?: string;
    authenticationTokenExpires?: number;
    googleAccess?: string;
    twitterAccess?: string;
    plan?: AccountPlanType;
}
