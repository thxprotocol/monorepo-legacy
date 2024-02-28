import mongoose from 'mongoose';

export type QuestDailyEntryDocument = mongoose.Document & TDailyRewardClaim;

export const QuestDailyEntry = mongoose.model<QuestDailyEntryDocument>(
    'QuestDailyEntry',
    new mongoose.Schema(
        {
            questId: String,
            sub: String,
            uuid: String,
            amount: Number,
            poolId: String,
            state: Number,
            ip: String,
        },
        { timestamps: true },
    ),
    'questdailyentry',
);
