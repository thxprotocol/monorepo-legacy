import mongoose from 'mongoose';
import { questSchema } from './Quest';

export type QuestSocialDocument = mongoose.Document & TQuestSocial;

export const QuestSocial = mongoose.model<QuestSocialDocument>(
    'QuestSocial',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            platform: Number,
            kind: String,
            interaction: Number,
            content: String,
            contentMetadata: String,
        },
        { timestamps: true },
    ),
    'questsocial',
);
