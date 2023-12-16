import { AxiosRequestConfig } from 'axios';

type THXAPIClientOptions = {
    url: string;
} & THXOIDCConfig;

type THXBrowserClientOptions = {
    url: string;
    poolId: string;
    accessToken?: string; // Deprecates soon in favor of THX OIDCConfig
} & THXOIDCConfig;

type THXRequestConfig = {
    poolId?: string;
} & AxiosRequestConfig;

type THXOIDCConfig = {
    clientId: string;
    clientSecret: string;
    returnUrl?: string;
    issuer?: string;
};

type THXOIDCUser = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
};

type THXWidgetOptions = { url?: string; poolId: string };

export { THXWidgetOptions, THXAPIClientOptions, THXBrowserClientOptions, THXOIDCConfig, THXOIDCUser, THXRequestConfig };
