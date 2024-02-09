import mongoose from 'mongoose';
import { TTwitterCursor } from '@thxnetwork/types/interfaces';

export type TwitterCursorDocument = mongoose.Document & TTwitterCursor;

const twitterCursorSchema = new mongoose.Schema(
    {
        sub: String,
        requirement: Number,
        postId: String,
        nextToken: String,
    },
    { timestamps: true },
);

export const TwitterCursor = mongoose.model<TwitterCursorDocument>('twittercursors', twitterCursorSchema);
