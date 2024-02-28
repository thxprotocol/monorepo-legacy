import mongoose from 'mongoose';

export type TwitterRepostDocument = mongoose.Document & TTwitterRepost;

export const TwitterRepost = mongoose.model<TwitterRepostDocument>(
    'TwitterRepost',
    new mongoose.Schema(
        {
            userId: String,
            postId: String,
        },
        { timestamps: true },
    ),
    'twitterrepost',
);
