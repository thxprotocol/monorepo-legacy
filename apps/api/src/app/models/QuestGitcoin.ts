import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestGitcoinDocument = mongoose.Document & TGitcoinQuest;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        amount: Number,
        scorerId: Number,
        score: Number,
    },
    { timestamps: true },
);

export const QuestGitcoin = mongoose.model<QuestGitcoinDocument>('GitcoinQuests', schema, 'gitcoinquests');
