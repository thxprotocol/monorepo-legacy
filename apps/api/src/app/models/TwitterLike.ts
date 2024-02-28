import mongoose from 'mongoose';

export type TwitterLikeDocument = mongoose.Document & TTwitterLike;

export const TwitterLike = mongoose.model<TwitterLikeDocument>(
    'TwitterLike',
    new mongoose.Schema(
        {
            userId: String,
            postId: String,
        },
        { timestamps: true },
    ),
    'twitterlike',
);
