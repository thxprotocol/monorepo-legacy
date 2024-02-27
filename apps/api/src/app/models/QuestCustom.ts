import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestCustomDocument = mongoose.Document & TMilestoneReward;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amount: Number,
        limit: Number,
        eventName: String,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });
export const QuestCustom = mongoose.model<QuestCustomDocument>('MilestoneRewards', schema);
