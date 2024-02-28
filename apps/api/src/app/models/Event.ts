import mongoose from 'mongoose';

export type EventDocument = mongoose.Document & TEvent;

export const Event = mongoose.model<EventDocument>(
    'Event',
    new mongoose.Schema(
        {
            identityId: String,
            poolId: String,
            name: String,
        },
        { timestamps: true },
    ),
    'event',
);
