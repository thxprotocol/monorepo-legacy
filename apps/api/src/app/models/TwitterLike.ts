import mongoose from 'mongoose';

export type TwitterLikeDocument = mongoose.Document & TTwitterLike;

const twitterLikeSchema = new mongoose.Schema(
    {
        userId: String,
        postId: String,
    },
    { timestamps: true },
);

export const TwitterLike = mongoose.model<TwitterLikeDocument>('twitterlikes', twitterLikeSchema);
