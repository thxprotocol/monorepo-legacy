import { AccountPlanType } from './enums/AccountPlanType';
import { AccountVariant } from './enums/AccountVariant';
import { AccessTokenKind } from '@thxnetwork/types/enums/AccessTokenKind';
export interface TAccount {
    firstName: string;
    lastName: string;
    profileImg: string;
    plan: AccountPlanType;
    organisation: string;
    active: boolean;
    isEmailVerified: boolean;
    email: string;
    password: string;
    address: string;
    walletAddress: string;
    variant: AccountVariant;
    privateKey: string;
    otpSecret: string;
    twitterId?: string;
    lastLoginAt: number;
    acceptTermsPrivacy: boolean;
    acceptUpdates: boolean;
    comparePassword: any;
    tokens: IAccessToken[];
    getToken: (token: AccessTokenKind) => IAccessToken;
    setToken: (token: IAccessToken) => IAccessToken;
    unsetToken: (token: AccessTokenKind) => void;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAccessToken {
    kind: AccessTokenKind;
    accessToken?: string;
    refreshToken?: string;
    expiry?: number;
    userId?: string;
}
export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    walletAddress?: string;
    privateKey?: string;
    googleAccess?: boolean;
    youtubeViewAccess?: boolean;
    youtubeManageAccess?: boolean;
    twitterAccess?: boolean;
    githubAccess?: boolean;
    twitchAccess?: boolean;
    discordAccess?: boolean;
    authenticationToken?: string;
    authenticationTokenExpires?: number;
    lastLoginAt?: number;
    firstName?: string;
    lastName?: string;
    plan?: AccountPlanType;
    organisation?: string;
    email?: string;
    profileImg?: string;
}
