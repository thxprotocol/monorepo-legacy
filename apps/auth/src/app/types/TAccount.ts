import { AccountPlanType } from './enums/AccountPlanType';
import { AccountVariant } from './enums/AccountVariant';
import { AccessTokenKind } from './enums/AccessTokenKind';
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
    signupToken: string;
    otpSecret: string;
    signupTokenExpires: number;
    authenticationToken: string;
    authenticationTokenExpires: number;
    passwordResetToken: string;
    passwordResetExpires: number;
    googleAccessToken: string;
    googleRefreshToken: string;
    googleAccessTokenExpires: number;
    twitterAccessToken: string;
    twitterRefreshToken: string;
    twitterAccessTokenExpires: number;
    githubAccessToken: string;
    githubRefreshToken: string;
    githubAccessTokenExpires: number;
    githubAccessTokenRefresh: number;
    twitterId?: string;
    verifyEmailToken: string;
    verifyEmailTokenExpires: number;
    lastLoginAt: number;
    acceptTermsPrivacy: boolean;
    acceptUpdates: boolean;
    comparePassword: any;
    createdAt: Date;
    tokens: IAccessToken[];
}

export interface IAccessToken {
    kind: AccessTokenKind;
    accessToken: string;
    refreshToken?: string;
    expiry: number;
}
export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    privateKey?: string;
    googleAccess?: boolean;
    twitterAccess?: boolean;
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
