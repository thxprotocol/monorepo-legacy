import mongoose from 'mongoose';

export type TwitterPostDocument = mongoose.Document & TTwitterPost;

export const TwitterPost = mongoose.model<TwitterPostDocument>(
    'TwitterPost',
    new mongoose.Schema(
        {
            userId: String,
            postId: String,
            queryId: String,
            text: String,
            publicMetrics: {
                retweetCount: Number,
                replyCount: Number,
                likeCount: Number,
                quoteCount: Number,
                bookmarkCount: Number,
                impressionCount: Number,
            },
        },
        { timestamps: true },
    ),
    'twitterpost',
);
