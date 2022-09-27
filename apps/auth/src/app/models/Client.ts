import mongoose from 'mongoose';

export type ClientDocument = mongoose.Document & {
    _id: string;
    payload: {
        request_uris: string[];
    };
};

const clientSchema = new mongoose.Schema(
    {
        _id: String,
        payload: {
            request_uris: [String],
        },
    },
    { timestamps: false },
);

export const Client = mongoose.model<ClientDocument>('Client', clientSchema, 'client');
