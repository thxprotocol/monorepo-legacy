import { AccountPlanType, AccessTokenKind, Role, Goal } from '@thxnetwork/types/enums';
import { AccountVariant, TToken } from '@thxnetwork/types/interfaces';

export type TAccount = {
    _id: string;
    sub: string;
    username: string;
    firstName: string;
    lastName: string;
    profileImg: string;
    plan: AccountPlanType;
    website: string;
    organisation: string;
    active: boolean;
    isEmailVerified: boolean;
    email: string;
    address: string;
    variant: AccountVariant;
    otpSecret: string;
    acceptTermsPrivacy: boolean;
    acceptUpdates: boolean;
    role: Role;
    goal: Goal[];
    tokens: TToken[];
    createdAt: Date;
    updatedAt: Date;
    getToken: (token: AccessTokenKind) => TToken;
};
