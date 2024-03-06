import mongoose from 'mongoose';

export type TwitterFollowerDocument = mongoose.Document & TTwitterFollower;

const twitterFollowerSchema = new mongoose.Schema(
    {
        userId: String,
        targetUserId: String,
    },
    { timestamps: true },
);

export const TwitterFollower = mongoose.model<TwitterFollowerDocument>(
    'TwitterFollower',
    twitterFollowerSchema,
    'twitterfollower',
);
