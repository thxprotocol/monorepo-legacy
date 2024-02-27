import mongoose from 'mongoose';

export type QuestInviteEntryDocument = mongoose.Document & TQuestInviteEntry;

const schema = new mongoose.Schema(
    {
        rewardId: String,
        sub: { type: String, index: 'hashed' },
        uuid: String,
        amount: String,
        isApproved: Boolean,
        poolId: String,
        metadata: String,
    },
    { timestamps: true },
);

export const QuestInviteEntry = mongoose.model<QuestInviteEntryDocument>('QuestInviteEntrys', schema);
