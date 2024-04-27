import mongoose from 'mongoose';

export type TwitterQueryDocument = mongoose.Document & TTwitterQuery;

export const TwitterQuery = mongoose.model<TwitterQueryDocument>(
    'TwitterQuery',
    new mongoose.Schema(
        {
            poolId: String,
            query: String,
            matchCount: Number,
            operators: {
                from: [String],
                to: [String],
                text: [String],
                url: [String],
                hashtags: [String],
                cashtags: [String],
                mentions: [String],
                media: String,
                maxAgeInSeconds: Number,
                likeCount: Number,
                repostCount: Number,
            },
        },
        { timestamps: true },
    ),
    'twitterquery',
);
