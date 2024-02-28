import mongoose from 'mongoose';

export type QuestInviteEntryDocument = mongoose.Document & TQuestInviteEntry;

export const QuestInviteEntry = mongoose.model<QuestInviteEntryDocument>(
    'QuestInviteEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            uuid: String,
            amount: String,
            isApproved: Boolean,
            poolId: String,
            metadata: String,
        },
        { timestamps: true },
    ),
    'questinviteentry',
);
