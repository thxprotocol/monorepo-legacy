import mongoose from 'mongoose';
import { questSchema } from './Quest';

export type QuestSocialDocument = mongoose.Document & TQuestSocial;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amount: Number,
        platform: Number,
        kind: String,
        interaction: Number,
        content: String,
        contentMetadata: String,
    },
    { timestamps: true },
);

export const QuestSocial = mongoose.model<QuestSocialDocument>('PointReward', schema, 'pointrewards');
