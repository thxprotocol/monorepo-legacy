import mongoose from 'mongoose';

export type EventDocument = mongoose.Document & TEvent;

const eventSchema = new mongoose.Schema(
    {
        identityId: String,
        poolId: String,
        name: String,
    },
    { timestamps: true },
);

export const Event = mongoose.model<EventDocument>('Event', eventSchema, 'events');
