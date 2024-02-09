import mongoose from 'mongoose';
import { TTwitterFollower } from '@thxnetwork/types/interfaces';

export type TwitterFollowerDocument = mongoose.Document & TTwitterFollower;

const twitterFollowerSchema = new mongoose.Schema(
    {
        userId: String,
        targetUserId: String,
    },
    { timestamps: true },
);

export const TwitterFollower = mongoose.model<TwitterFollowerDocument>('twitterfollowers', twitterFollowerSchema);
