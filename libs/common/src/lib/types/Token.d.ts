type TToken = {
    sub: string;
    kind: AccessTokenKind;
    accessToken: string;
    refreshToken: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    scopes: OAuthScope[];
    expiry: number;
    userId: string;
    metadata: any;
};
