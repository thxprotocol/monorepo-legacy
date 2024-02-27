import mongoose from 'mongoose';

export type QuestSocialEntryDocument = mongoose.Document & TQuestSocialEntry;

const schema = new mongoose.Schema(
    {
        questId: String,
        sub: { type: String, index: 'hashed' },
        amount: Number,
        poolId: String,
        platformUserId: String,
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

export const QuestSocialEntry = mongoose.model<QuestSocialEntryDocument>(
    'QuestSocialEntry',
    schema,
    'pointrewardclaims',
);
