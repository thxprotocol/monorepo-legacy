import { AccessTokenKind } from '../enums/AccessTokenKind';

export type TToken = {
    sub: string;
    kind: AccessTokenKind;
    accessToken: string;
    refreshToken: string;
    accessTokenEncrypted: string;
    refreshTokenEncrypted: string;
    scope: string;
    expiry: number;
    userId: string;
    metadata: any;
};
