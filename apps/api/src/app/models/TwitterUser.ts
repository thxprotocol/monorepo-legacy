import mongoose from 'mongoose';

export type TwitterUserDocument = mongoose.Document & TTwitterUser;

const twitterUserSchema = new mongoose.Schema(
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
);

export const TwitterUser = mongoose.model<TwitterUserDocument>('twitterusers', twitterUserSchema);
