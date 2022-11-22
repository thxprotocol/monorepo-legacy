export default interface Credential {
    clientId: string;
    clientSecret: string;
    grantType: 'client_credentials' | 'authorization_code';
    env: string;
    /* Optionals */
    requestUrl?: string;
    redirectUrl?: string;
    scopes?: string;
    automaticSilentRenew?: boolean;
    post_logout_redirect_uri?: string;
    silent_redirect_uri?: string;
}
