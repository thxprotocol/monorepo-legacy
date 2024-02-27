import mongoose from 'mongoose';

export type QuestCustomEntryDocument = mongoose.Document & TMilestoneRewardClaim;

const schema = new mongoose.Schema(
    {
        questId: String,
        sub: { type: String, index: 'hashed' },
        uuid: String,
        amount: Number,
        isClaimed: Boolean,
        poolId: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const QuestCustomEntry = mongoose.model<QuestCustomEntryDocument>('MilestoneRewardClaims', schema);
