export default interface Credential {
    clientId: string;
    clientSecret: string;
    grantType: 'client_credentials' | 'authorization_code';
    /* Optionals */
    requestUrl?: string;
    redirectUrl?: string;
    scopes?: string;
}
