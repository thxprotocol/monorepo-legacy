import { AxiosRequestConfig } from 'axios';

type THXAPIClientOptions = {
    apiUrl: string;
} & THXOIDCConfig;

type THXBrowserClientOptions = {
    apiUrl: string;
    poolId: string;
} & THXOIDCConfig;

type THXRequestConfig = {
    poolId?: string;
} & AxiosRequestConfig;

type THXOIDCConfig = {
    authUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
};

type THXOIDCUser = {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
};

type THXWidgetOptions = { campaignId?: string; poolId?: string; identity?: string; apiUrl?: string };

export { THXWidgetOptions, THXAPIClientOptions, THXBrowserClientOptions, THXOIDCConfig, THXOIDCUser, THXRequestConfig };
