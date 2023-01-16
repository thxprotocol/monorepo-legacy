import { AccountPlanType, ChainId } from '@thxnetwork/api/types/enums';
export interface IAccount {
    sub?: string;
    address: string;
    walletAddress: string;
    privateKey: string;
    googleAccess: boolean;
    youtubeViewAccess: boolean;
    youtubeManageAccess: boolean;
    twitterAccess: boolean;
    youtube?: any;
    twitter?: any;
    plan: AccountPlanType;
    email: string;
    firstName: string;
    lastName: string;
}
export interface ERC20Token {
    chainId: ChainId;
    address: string;
}

export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    walletAddress?: string;
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
}
