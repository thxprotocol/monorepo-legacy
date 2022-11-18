export default interface Credential {
    clientId: string;
    clientSecret: string;
    grantType: 'client_credentials' | 'authorization_code';
    /* Optionals */
    env?: string;
    requestUrl?: string;
    redirectUrl?: string;
    scopes?: string;
    automaticSilentRenew?: boolean;
    silent_redirect_uri?: string;
}
