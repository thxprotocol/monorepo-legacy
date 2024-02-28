import mongoose from 'mongoose';

export type TClient = {
    sub: string;
    name: string;
    poolId: string;
    grantType: string;
    clientId: string;
    clientSecret: string;
    requestUris: string[];
    registrationAccessToken: string;
    origins?: string[];
};
export type TClientPayload = {
    application_type: string;
    grant_types: string[];
    scope: string;
    response_types: string[];
    request_uris?: string[];
    redirect_uris?: string[];
    post_logout_redirect_uris?: string[];
};

export type ClientDocument = mongoose.Document & TClient;

export const Client = mongoose.model<ClientDocument>(
    'Client',
    new mongoose.Schema(
        {
            sub: String,
            name: String,
            poolId: String,
            clientId: String,
            clientSecret: String,
            grantType: String,
            registrationAccessToken: String,
            origins: [String],
        },
        { timestamps: true },
    ),
    'client',
);
