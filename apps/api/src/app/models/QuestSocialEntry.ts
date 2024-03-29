import mongoose from 'mongoose';

export type QuestSocialEntryDocument = mongoose.Document & TQuestSocialEntry;

export const QuestSocialEntry = mongoose.model<QuestSocialEntryDocument>(
    'QuestSocialEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            amount: Number,
            poolId: String,
            metadata: {
                platformUserId: String,
                publicMetrics: {
                    followersCount: Number,
                    followingCount: Number,
                    tweetCount: Number,
                    listedCount: Number,
                    likeCount: Number,
                },
            },
        },
        { timestamps: true },
    ),
    'questsocialentry',
);
