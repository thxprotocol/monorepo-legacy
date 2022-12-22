export default interface Credential {
    clientId: string;
    clientSecret: string;
    env: string;
    /* Optionals */
    grantType?: 'client_credentials' | 'authorization_code';
    poolId?: string;
    requestUrl?: string;
    redirectUrl?: string;
    scopes?: string;
    automaticSilentRenew?: boolean;
    post_logout_redirect_uri?: string;
    popup_post_logout_redirect_uri?: string;
    silent_redirect_uri?: string;
}
