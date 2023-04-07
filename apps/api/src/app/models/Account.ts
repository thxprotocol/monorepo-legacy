import { AccountPlanType, ChainId } from '@thxnetwork/types/enums';
export interface IAccount {
    sub?: string;
    address: string;
    privateKey: string;
    googleAccess: boolean;
    youtubeViewAccess: boolean;
    youtubeManageAccess: boolean;
    twitterAccess: boolean;
    shopifyAccess: boolean;
    discordAccess: boolean;
    youtube?: any;
    twitter?: any;
    plan: AccountPlanType;
    email: string;
    firstName: string;
    lastName: string;
    shopifyStoreUrl?: string;
    getAddress: (chainId: ChainId) => Promise<string>;
}
export interface ERC20Token {
    chainId: ChainId;
    address: string;
}

export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    authenticationToken?: string;
    authenticationTokenExpires?: number;
    googleAccess?: boolean;
    youtubeViewAccess?: boolean;
    youtubeManageAccess?: boolean;
    twitterAccess?: boolean;
    githubAccess?: boolean;
    twitchAccess?: boolean;
    discordAccess?: boolean;
    plan?: AccountPlanType;
    email?: string;
}
