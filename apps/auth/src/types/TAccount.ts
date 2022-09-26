import { AccountPlanType } from './enums/AccountPlanType';
import { AccountVariant } from './enums/AccountVariant';

export interface TAccount {
    firstName: string;
    lastName: string;
    profileImg: string;
    plan: AccountPlanType;
    organisation: string;
    active: boolean;
    email: string;
    password: string;
    address: string;
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
    spotifyAccessToken: string;
    spotifyRefreshToken: string;
    spotifyAccessTokenExpires: number;
    lastLoginAt: number;
    acceptTermsPrivacy: boolean;
    acceptUpdates: boolean;
    comparePassword: any;
    createdAt: Date;
}
export interface IAccountUpdates {
    acceptTermsPrivacy?: boolean;
    acceptUpdates?: boolean;
    address?: string;
    privateKey?: string;
    googleAccess?: boolean;
    twitterAccess?: boolean;
    spotifyAccess?: boolean;
    authenticationToken?: string;
    authenticationTokenExpires?: number;
    lastLoginAt?: number;
    firstName?: string;
    lastName?: string;
    plan?: AccountPlanType;
    organisation?: string;
    profileImg?: string;
}
