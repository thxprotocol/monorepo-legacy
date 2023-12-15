import { THXOIDCGrant } from './enums/Grant';

type THXAPIClientOptions = {
    url: string;
    poolId: string;
    accessToken?: string; // Deprecates soon in favor of THX OIDCConfig
} & THXOIDCConfig;

type THXBrowserClientOptions = {
    url: string;
    poolId: string;
    accessToken?: string; // Deprecates soon in favor of THX OIDCConfig
} & THXOIDCConfig;

type THXOIDCConfig = {
    clientId: string;
    clientSecret: string;
    grantType: THXOIDCGrant;
    scope: string;
    issuer?: string;
};

type THXOIDCUser = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
};

type THXWidgetOptions = { url?: string; poolId: string };

export { THXWidgetOptions, THXAPIClientOptions, THXBrowserClientOptions, THXOIDCConfig, THXOIDCUser };
