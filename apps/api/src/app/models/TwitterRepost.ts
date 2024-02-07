import mongoose from 'mongoose';
import { TTwitterRepost } from '@thxnetwork/types/interfaces';

export type TwitterRepostDocument = mongoose.Document & TTwitterRepost;

const twitterRepostSchema = new mongoose.Schema(
    {
        userId: String,
        postId: String,
    },
    { timestamps: true },
);

export const TwitterRepost = mongoose.model<TwitterRepostDocument>('twitterreposts', twitterRepostSchema);
