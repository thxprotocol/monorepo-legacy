import mongoose from 'mongoose';

export type TwitterUserDocument = mongoose.Document & TTwitterUser;

export const TwitterUser = mongoose.model<TwitterUserDocument>(
    'TwitterUser',
    new mongoose.Schema(
        {
            userId: String,
            profileImgUrl: String,
            name: String,
            username: String,
            publicMetrics: {
                followersCount: Number,
                followingCount: Number,
                tweetCount: Number,
                listedCount: Number,
                likeCount: Number,
            },
        },
        { timestamps: true },
    ),
    'twitteruser',
);
