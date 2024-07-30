type TAccount = {
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
    identity: string;
    createdAt: Date;
    updatedAt: Date;
    providerUserId: string;
    signingSecret: string;
};

type TProvider = {
    kind: AccessTokenKind;
    scopes: OAuthRequiredScopes;
    label: string;
    color: string;
};
