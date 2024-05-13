import mongoose from 'mongoose';

export type TwitterQueryDocument = mongoose.Document & TTwitterQuery;

export const TwitterQuery = mongoose.model<TwitterQueryDocument>(
    'TwitterQuery',
    new mongoose.Schema(
        {
            poolId: String,
            query: String,
            operators: {
                from: [String],
                to: [String],
                text: [String],
                url: [String],
                hashtags: [String],
                mentions: [String],
                media: String,
                excludes: [String],
            },
            defaults: {
                title: String,
                description: String,
                amount: Number,
                isPublished: Boolean,
                expiryInDays: Number,
                locks: [{ questId: String, variant: Number }],
            },
        },
        { timestamps: true },
    ),
    'twitterquery',
);
